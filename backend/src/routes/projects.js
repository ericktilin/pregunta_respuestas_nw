// =====================================================================
// routes/projects.js
// Endpoints de "Proyectos Reutilizables". POST /api/projects recibe
// multipart/form-data (multer): title, description, repo_url,
// category_slug, stack (JSON string), readme, contributors y archivos.
// =====================================================================
import { Router } from 'express'
import fs from 'node:fs'
import oracledb from 'oracledb'
import { query, getPool } from '../config/db.js'
import ssoAuth from '../middleware/ssoAuth.js'
import { upload, UPLOAD_DIR } from '../middleware/upload.js'

export { UPLOAD_DIR }

const router = Router()

// Lista de proyectos con su stack + adjuntos agregados.
const SELECT_PROJECTS = `
  SELECT p.id, p.title, p.description, p.repo_url, p.status_badge,
         p.stars_count, p.forks_count, p.usage_count, p.contributors, p.readme,
         p.created_at,
         u.full_name AS author_name, u.avatar_initials AS author_initials,
         u.role_title AS author_role,
         c.name AS category_name, c.slug AS category_slug, c.color_code AS category_color,
         (SELECT LISTAGG(ps.technology, ', ') WITHIN GROUP (ORDER BY ps.technology)
            FROM project_stack ps WHERE ps.project_id = p.id) AS stack_csv,
         (SELECT LISTAGG(a.file_url || '§' || a.file_name, '|||') WITHIN GROUP (ORDER BY a.id)
            FROM attachments a
           WHERE a.attachable_type = 'project' AND a.attachable_id = p.id) AS attachments_csv
    FROM projects p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN categories c ON c.id = p.category_id`

// POST /api/projects  (requiere SSO, multipart/form-data)
router.post('/', ssoAuth, upload.single('attachment'), async (req, res, next) => {
  try {
    const {
      title,
      description = '',
      repo_url = '',
      category_slug = 'desarrollo',
      status_badge = 'Disponible',
      readme = '',
      contributors = '',
    } = req.body
    if (!title?.trim()) {
      const err = new Error('title es obligatorio')
      err.status = 400
      throw err
    }
    if (!repo_url?.trim()) {
      const err = new Error('repo_url es obligatorio')
      err.status = 400
      throw err
    }

    // El campo "stack" llega como JSON string (p.ej. '["React","Node.js"]').
    let stack = []
    if (typeof req.body.stack === 'string' && req.body.stack.trim()) {
      try {
        stack = JSON.parse(req.body.stack)
      } catch {
        stack = req.body.stack.split(',').map((s) => s.trim())
      }
    }
    const techList = [...new Set(stack.map(String).map((s) => s.trim()).filter(Boolean))].slice(0, 12)

    const file = req.file
    const pool = await getPool()
    const conn = await pool.getConnection()
    try {
      const result = await conn.execute(
        `INSERT INTO projects (user_id, category_id, title, description, repo_url, status_badge,
                               readme, usage_count, contributors)
         VALUES (:u, (SELECT id FROM categories WHERE slug = :c), :t, :d, :r, :s, :rm, 0, :co)
         RETURNING id INTO :id`,
        {
          u: req.user.id,
          c: String(category_slug).trim(),
          t: String(title).trim(),
          d: String(description).trim(),
          r: String(repo_url).trim(),
          s: String(status_badge).trim(),
          rm: String(readme || '').trim(),
          co: String(contributors || '').trim(),
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
      )
      const projectId = result.outBinds.id[0]

      if (techList.length > 0) {
        await conn.executeMany(
          `INSERT INTO project_stack (project_id, technology) VALUES (:0, :1)`,
          techList.map((tech) => [projectId, tech]),
        )
      }

      if (file) {
        // Ojo: `size` es palabra reservada de Oracle -> genera ORA-01745;
        // por eso usamos binds con nombres descriptivos (fileSize, etc.).
        await conn.execute(
          `INSERT INTO attachments (attachable_type, attachable_id, file_name, file_url, file_size)
           VALUES ('project', :attachId, :fileName, :fileUrl, :fileSize)`,
          {
            attachId: projectId,
            fileName: file.originalname,
            fileUrl: `/api/uploads/${file.filename}`,
            fileSize: file.size,
          },
        )
      }

      await conn.commit()
      res.status(201).json({ id: projectId, stack: techList })
    } catch (err) {
      // Si algo falla, no dejamos archivos huérfanos en disco.
      if (file) fs.rmSync(file.path, { force: true })
      await conn.rollback()
      throw err
    } finally {
      await conn.close()
    }
  } catch (err) {
    next(err)
  }
})

// GET /api/projects
router.get('/', async (_req, res, next) => {
  try {
    const rows = await query(`${SELECT_PROJECTS} ORDER BY p.created_at DESC`)
    res.json(rows.map(serializeProject))
  } catch (err) {
    next(err)
  }
})

// GET /api/projects/:id  -> detalle con stack + adjuntos descargables
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const rows = await query(`${SELECT_PROJECTS} WHERE p.id = :0`, [id])
    if (rows.length === 0) return res.status(404).json({ error: 'Proyecto no encontrado' })

    const attachments = await query(
      `SELECT id, file_name, file_url, file_size
         FROM attachments
        WHERE attachable_type = 'project' AND attachable_id = :0
        ORDER BY id`,
      [id],
    )

    res.json({ ...serializeProject(rows[0]), attachments })
  } catch (err) {
    next(err)
  }
})

function serializeProject(row) {
  const { stack_csv: stackCsv, attachments_csv: attachmentsCsv, ...rest } = row
  return {
    ...rest,
    stack: stackCsv ? stackCsv.split(',').map((s) => s.trim()).filter(Boolean) : [],
    attachments: parseAttachmentsCsv(attachmentsCsv),
  }
}

// Convierte "urlnombre|||urlnombre" en [{ file_url, file_name }].
function parseAttachmentsCsv(csv) {
  if (!csv) return []
  return csv
    .split('|||')
    .map((part) => {
      const idx = part.indexOf('§')
      if (idx === -1) return null
      return { file_url: part.slice(0, idx), file_name: part.slice(idx + 1) }
    })
    .filter(Boolean)
}

export default router