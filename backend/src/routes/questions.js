// =====================================================================
// routes/questions.js
// ---------------------------------------------------------------------
// Endpoints del feed de preguntas, detalle, votos, guardados y respuestas.
// =====================================================================
import { Router } from 'express'
import fs from 'node:fs'
import oracledb from 'oracledb'
import { query, getPool } from '../config/db.js'
import ssoAuth from '../middleware/ssoAuth.js'
import { upload } from '../middleware/upload.js'

const router = Router()

// Consulta base reutilizada por el feed y por el detalle.
const SELECT_WITH_JOINS = `
  SELECT q.id,
         q.title,
         q.body_text,
         q.status,
         q.votes_count,
         q.created_at,
         u.id        AS author_id,
         u.full_name AS author_name,
         u.avatar_initials AS author_initials,
         u.role_title AS author_role,
         c.id        AS category_id,
         c.name      AS category_name,
         c.slug      AS category_slug,
         c.color_code AS category_color,
         (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) AS answers_count,
         (SELECT LISTAGG(t.tag_name, ',') WITHIN GROUP (ORDER BY t.tag_name)
            FROM question_tags t WHERE t.question_id = q.id) AS tags_csv,
         (SELECT LISTAGG(att.file_url || '§' || att.file_name, '|||') WITHIN GROUP (ORDER BY att.id)
            FROM attachments att
           WHERE att.attachable_type = 'question' AND att.attachable_id = q.id) AS attachments_csv
    FROM questions q
    JOIN users u      ON u.id = q.user_id
    JOIN categories c ON c.id = q.category_id`

// GET /api/questions
// Feed con filtros (todos opcionales):
//   ?category=redes          -> filtra por slug de categoría
//   ?status=open|in_progress|resolved
//   ?q=texto                 -> búsqueda en título/cuerpo
//   ?sort=recent|votes|views -> orden (por defecto: recientes)
router.get('/', async (req, res, next) => {
  try {
    const { category, status, q, sort } = req.query

    // Armamos el WHERE dinámicamente. Usamos binds posicionales :0, :1, :2...
    const where = []
    const binds = []
    let i = 0

    if (category) {
      where.push(`c.slug = :${i++}`)
      binds.push(category)
    }
    if (status) {
      where.push(`q.status = :${i++}`)
      binds.push(status)
    }
    if (q && String(q).trim()) {
      where.push(`(INSTR(LOWER(q.title), LOWER(:${i++})) > 0 OR INSTR(LOWER(q.body_text), LOWER(:${i++})) > 0)`)
      binds.push(String(q).trim(), String(q).trim())
    }

    const orderBy = {
      recent: 'q.created_at DESC',
      votes: 'q.votes_count DESC, q.created_at DESC',
    }[sort] || 'q.created_at DESC'

    const sql = `${SELECT_WITH_JOINS}
       ${where.length ? ' WHERE ' + where.join(' AND ') : ''}
       ORDER BY ${orderBy}`

    const rows = await query(sql, binds)
    res.json(rows.map(serializeLine))
  } catch (err) {
    next(err)
  }
})

// GET /api/questions/:id
// Detalle de una pregunta. Las respuestas se devuelven en `answers` y
// cada una incluye sus adjuntos (attachments).
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const rows = await query(`${SELECT_WITH_JOINS} WHERE q.id = :0`, [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pregunta no encontrada' })
    }

    const answers = await query(
      `SELECT a.id,
              a.body_text,
              a.is_accepted,
              a.votes_count,
              a.parent_answer_id,
              a.created_at,
              u.id        AS author_id,
              u.full_name AS author_name,
              u.avatar_initials AS author_initials,
              u.role_title AS author_role
         FROM answers a
         JOIN users u ON u.id = a.user_id
        WHERE a.question_id = :0
        ORDER BY a.created_at ASC`,
      [id],
    )

    // Adjuntos de la pregunta.
    const questionAttachments = await query(
      `SELECT id, file_name, file_url, file_size
         FROM attachments
        WHERE attachable_type = 'question' AND attachable_id = :0
        ORDER BY id`,
      [id],
    )

    // Adjuntos de cada respuesta (una sola consulta por la pregunta).
    const answerIds = answers.map((a) => a.id)
    const attachmentsByAnswer = new Map()
    if (answerIds.length > 0) {
      const placeholders = answerIds.map((_, i) => `:${i}`).join(', ')
      const answerAttachments = await query(
        `SELECT attachable_id, id, file_name, file_url, file_size
           FROM attachments
          WHERE attachable_type = 'answer'
            AND attachable_id IN (${placeholders})
          ORDER BY id`,
        answerIds,
      )
      for (const att of answerAttachments) {
        const list = attachmentsByAnswer.get(att.attachable_id) ?? []
        list.push({
          id: att.id,
          file_name: att.file_name,
          file_url: att.file_url,
          file_size: att.file_size,
        })
        attachmentsByAnswer.set(att.attachable_id, list)
      }
    }
    for (const a of answers) {
      a.attachments = attachmentsByAnswer.get(a.id) ?? []
    }

    const detail = serializeLine(rows[0])
    detail.attachments = questionAttachments
    res.json({ ...detail, answers })
  } catch (err) {
    next(err)
  }
})

// POST /api/questions  (requiere SSO)
// Publica una nueva pregunta. Puede llegar como JSON
//   { title, body_text, category_slug, tags: ["oracle", "sql"] }
// o como multipart/form-data con el campo "attachments" (varios archivos)
// para adjuntar evidencias (PNG, PDF, etc.).
router.post('/', ssoAuth, upload.array('attachments', 5), async (req, res, next) => {
  const { title, body_text, category_slug } = req.body
  if (!title || !body_text || !category_slug) {
    return res.status(400).json({ error: 'title, body_text y category_slug son obligatorios' })
  }

  const files = req.files ?? []
  try {
    const pool = await getPool()
    const conn = await pool.getConnection()
    try {
      // Insertamos la pregunta y recuperamos su nuevo id con RETURNING.
      const result = await conn.execute(
        `INSERT INTO questions (user_id, category_id, title, body_text, status)
         VALUES (:u, (SELECT id FROM categories WHERE slug = :c), :t, :b, 'open')
         RETURNING id INTO :id`,
        {
          u: req.user.id,
          c: category_slug,
          t: String(title).trim(),
          b: String(body_text).trim(),
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
      )
      const questionId = result.outBinds.id[0]

      // Etiquetas: se normalizan (minúsculas, únicas, máx. 10).
      const tagList = parseTags(req.body.tags)

      if (tagList.length > 0) {
        await conn.executeMany(
          `INSERT INTO question_tags (question_id, tag_name) VALUES (:0, :1)`,
          tagList.map((tag) => [questionId, tag]),
        )
      }

      // Adjuntos (PNG/PDF/archivos) — se registran contra la pregunta.
      if (files.length > 0) {
        await conn.executeMany(
          `INSERT INTO attachments (attachable_type, attachable_id, file_name, file_url, file_size)
           VALUES ('question', :0, :1, :2, :3)`,
          files.map((f) => [questionId, f.originalname, `/api/uploads/${f.filename}`, f.size]),
        )
      }

      await conn.commit()
      res.status(201).json({ id: questionId })
    } catch (err) {
      files.forEach((f) => fs.rmSync(f.path, { force: true }))
      await conn.rollback()
      throw err
    } finally {
      await conn.close()
    }
  } catch (err) {
    next(err)
  }
})

// POST /api/questions/:id/answers  (requiere SSO)
// Publica una respuesta a la pregunta. Cuerpo: { body_text, parent_answer_id? }
// `parent_answer_id` opcional → respuesta en hilo (anidada) a otra respuesta.
// También acepta multipart/form-data con "attachments" (PNG/PDF/archivos).
router.post('/:id/answers', ssoAuth, upload.array('attachments', 5), async (req, res, next) => {
  const questionId = Number(req.params.id)
  const { body_text, parent_answer_id } = req.body
  if (!body_text || !String(body_text).trim()) {
    return res.status(400).json({ error: 'body_text es obligatorio' })
  }

  const parentId = parent_answer_id ? Number(parent_answer_id) : null
  if (parentId) {
    // La respuesta padre debe existir y pertenecer a la misma pregunta.
    const parent = await query(
      `SELECT id FROM answers WHERE id = :0 AND question_id = :1`,
      [parentId, questionId],
    )
    if (parent.length === 0) {
      return res.status(400).json({ error: 'La respuesta a la que respondes no existe' })
    }
  }

  const files = req.files ?? []
  try {
    const pool = await getPool()
    const conn = await pool.getConnection()
    try {
      const result = await conn.execute(
        `INSERT INTO answers (question_id, user_id, body_text, is_accepted, parent_answer_id)
         VALUES (:q, :u, :b, 0, :p)
         RETURNING id INTO :id`,
        {
          q: questionId,
          u: req.user.id,
          b: String(body_text).trim(),
          p: parentId,
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
      )
      const answerId = result.outBinds.id[0]

      if (files.length > 0) {
        await conn.executeMany(
          `INSERT INTO attachments (attachable_type, attachable_id, file_name, file_url, file_size)
           VALUES ('answer', :0, :1, :2, :3)`,
          files.map((f) => [answerId, f.originalname, `/api/uploads/${f.filename}`, f.size]),
        )
      }

      await conn.commit()
      res.status(201).json({ id: answerId })
    } catch (err) {
      files.forEach((f) => fs.rmSync(f.path, { force: true }))
      await conn.rollback()
      throw err
    } finally {
      await conn.close()
    }
  } catch (err) {
    next(err)
  }
})

// PATCH /api/questions/:id/answers/:answerId/accept  (requiere SSO)
// Marca una respuesta como solución aceptada. SOLO el autor de la pregunta
// puede hacerlo. Al aceptar una nueva, las demás se desmarcan (una sola
// "Solución Aceptada" por hilo). Cuerpo: { accepted: true|false }.
router.patch('/:id/answers/:answerId/accept', ssoAuth, async (req, res, next) => {
  const questionId = Number(req.params.id)
  const answerId = Number(req.params.answerId)
  const accepted = Boolean(req.body?.accepted)

  try {
    // Solo el autor de la pregunta puede aceptar respuestas.
    const owned = await query(
      `SELECT id FROM questions WHERE id = :0 AND user_id = :1`,
      [questionId, req.user.id],
    )
    if (owned.length === 0) {
      return res.status(404).json({ error: 'Pregunta no encontrada' })
    }

    const pool = await getPool()
    const conn = await pool.getConnection()
    try {
      if (accepted) {
        await conn.execute(`UPDATE answers SET is_accepted = 0 WHERE question_id = :qid`, {
          qid: questionId,
        })
      }
      // Nota: usamos binds por objeto — node-oracledb (thin) rechaza binds
      // posicionales numéricos contra columnas NUMBER(1) (ORA-01438).
      await conn.execute(`UPDATE answers SET is_accepted = :acc WHERE id = :id`, {
        acc: accepted ? 1 : 0,
        id: answerId,
      })
      await conn.commit()
      res.json({ id: answerId, is_accepted: accepted ? 1 : 0 })
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      await conn.close()
    }
  } catch (err) {
    next(err)
  }
})

// POST /api/questions/:id/vote  (requiere SSO)
// Like único por usuario (toggle): si ya votó lo quita, si no lo agrega.
// Devuelve el nuevo contador y si el usuario quedó votando (voted).
router.post('/:id/vote', ssoAuth, async (req, res, next) => {
  const id = Number(req.params.id)
  try {
    const pool = await getPool()
    const conn = await pool.getConnection()
    try {
      const [existing] = await query(
        `SELECT 1 AS one FROM question_votes WHERE question_id = :0 AND user_id = :1`,
        [id, req.user.id],
      )
      let voted
      if (existing) {
        await conn.execute(
          `DELETE FROM question_votes WHERE question_id = :0 AND user_id = :1`,
          [id, req.user.id],
        )
        await conn.execute(
          `UPDATE questions SET votes_count = CASE WHEN votes_count > 0 THEN votes_count - 1 ELSE 0 END WHERE id = :0`,
          [id],
        )
        voted = false
      } else {
        await conn.execute(
          `INSERT INTO question_votes (question_id, user_id) VALUES (:0, :1)`,
          [id, req.user.id],
        )
        await conn.execute(`UPDATE questions SET votes_count = votes_count + 1 WHERE id = :0`, [id])
        voted = true
      }
      await conn.commit()
      const [row] = await query(`SELECT votes_count FROM questions WHERE id = :0`, [id])
      res.json({ id, votes_count: row?.votes_count ?? 0, voted })
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      await conn.close()
    }
  } catch (err) {
    next(err)
  }
})

// POST /api/questions/:id/save  (requiere SSO)
// Guarda/quita la pregunta en "saved_items" (toggle).
router.post('/:id/save', ssoAuth, async (req, res, next) => {
  const id = Number(req.params.id)
  try {
    const pool = await getPool()
    const conn = await pool.getConnection()
    try {
      const [existing] = await query(
        `SELECT 1 AS one FROM saved_items WHERE user_id = :0 AND item_type = 'question' AND item_id = :1`,
        [req.user.id, id],
      )
      let saved
      if (existing) {
        await conn.execute(
          `DELETE FROM saved_items WHERE user_id = :0 AND item_type = 'question' AND item_id = :1`,
          [req.user.id, id],
        )
        saved = false
      } else {
        await conn.execute(
          `INSERT INTO saved_items (user_id, item_type, item_id) VALUES (:0, 'question', :1)`,
          [req.user.id, id],
        )
        saved = true
      }
      await conn.commit()
      res.status(saved ? 201 : 200).json({ saved })
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      await conn.close()
    }
  } catch (err) {
    next(err)
  }
})

// PUT /api/questions/:id  (requiere SSO)
// Edita una pregunta propia: título, detalle, categoría y etiquetas.
// Cuerpo esperado: { title?, body_text?, category_slug?, tags? }.
router.put('/:id', ssoAuth, async (req, res, next) => {
  const id = Number(req.params.id)
  const { title, body_text, category_slug, tags } = req.body
  if (title !== undefined && !String(title).trim()) {
    return res.status(400).json({ error: 'title no puede quedar vacío' })
  }
  if (body_text !== undefined && !String(body_text).trim()) {
    return res.status(400).json({ error: 'body_text no puede quedar vacío' })
  }

  try {
    const owned = await query(
      `SELECT id FROM questions WHERE id = :0 AND user_id = :1`,
      [id, req.user.id],
    )
    if (owned.length === 0) return res.status(404).json({ error: 'Pregunta no encontrada' })

    let categoryId
    if (category_slug !== undefined) {
      const catRows = await query(`SELECT id FROM categories WHERE slug = :0`, [String(category_slug).trim()])
      if (catRows.length === 0) return res.status(400).json({ error: 'Categoría inválida' })
      categoryId = catRows[0].id
    }

    const pool = await getPool()
    const conn = await pool.getConnection()
    try {
      const sets = []
      const binds = []
      if (title !== undefined) { sets.push(`title = :${binds.length}`); binds.push(String(title).trim()) }
      if (body_text !== undefined) { sets.push(`body_text = :${binds.length}`); binds.push(String(body_text).trim()) }
      if (categoryId !== undefined) { sets.push(`category_id = :${binds.length}`); binds.push(categoryId) }

      if (sets.length > 0) {
        binds.push(id)
        await conn.execute(
          `UPDATE questions SET ${sets.join(', ')} WHERE id = :${binds.length - 1}`,
          binds,
        )
      }

      // Etiquetas: si se envían, se reemplazan por completo.
      if (Array.isArray(tags)) {
        const tagList = [...new Set(
          tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean),
        )].slice(0, 10)
        await conn.execute(`DELETE FROM question_tags WHERE question_id = :0`, [id])
        if (tagList.length > 0) {
          await conn.executeMany(
            `INSERT INTO question_tags (question_id, tag_name) VALUES (:0, :1)`,
            tagList.map((tag) => [id, tag]),
          )
        }
      }

      await conn.commit()
      res.json({ id, updated: true })
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      await conn.close()
    }
  } catch (err) {
    next(err)
  }
})

// DELETE /api/questions/:id  (requiere SSO)
// Elimina una pregunta del usuario. Limpia también saved_items y
// question_votes (respuestas y etiquetas cascadan por FK).
router.delete('/:id', ssoAuth, async (req, res, next) => {
  const id = Number(req.params.id)
  try {
    const pool = await getPool()
    const conn = await pool.getConnection()
    try {
      const result = await conn.execute(
        `DELETE FROM questions WHERE id = :0 AND user_id = :1`,
        [id, req.user.id],
      )
      if (result.rowsAffected === 0) {
        await conn.rollback()
        return res.status(404).json({ error: 'Pregunta no encontrada' })
      }
      // Dependencias sin FK ON DELETE CASCADE:
      await conn.execute(`DELETE FROM saved_items WHERE item_type = 'question' AND item_id = :0`, [id])
      await conn.execute(`DELETE FROM question_votes WHERE question_id = :0`, [id])
      await conn.commit()
      res.json({ deleted: true })
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      await conn.close()
    }
  } catch (err) {
    next(err)
  }
})

// Convierte la fila a objeto JSON listo para el frontend:
//  - descompone tags_csv ("a,b,c") en un array
//  - deja el status con nombres legibles
function serializeLine(row) {
  const { tags_csv: tagsCsv, attachments_csv: attachmentsCsv, ...rest } = row
  return {
    ...rest,
    tags: tagsCsv ? tagsCsv.split(',').filter(Boolean) : [],
    attachments: parseAttachmentsCsv(attachmentsCsv),
  }
}

// Normaliza etiquetas: llegan como array (JSON) o como lista separada por
// comas (multipart). Devuelve únicas, en minúsculas y máx. 10.
function parseTags(raw) {
  let list = []
  if (Array.isArray(raw)) list = raw
  else if (typeof raw === 'string' && raw.trim()) {
    try {
      list = JSON.parse(raw)
    } catch {
      list = raw.split(',').map((s) => s.trim())
    }
  }
  return [...new Set(list.map((t) => String(t).trim().toLowerCase()).filter(Boolean))].slice(0, 10)
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