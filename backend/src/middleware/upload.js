// =====================================================================
// middleware/upload.js
// ---------------------------------------------------------------------
// Configuración central de multer para subir archivos adjuntos
// (PNG, PDF, imágenes y otros archivos) al disco del backend.
// Usado por proyectos, preguntas y respuestas.
// =====================================================================
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads')

// Nos aseguramos de que la carpeta de adjuntos exista.
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const ALLOWED_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', // imágenes
  '.pdf', // documentos
  '.zip', '.rar', '.7z', '.gz', // comprimidos
  '.doc', '.docx', '.xls', '.xlsx', // office
  '.txt', '.md', '.log', '.json', '.csv', // texto / datos
])

const MESSAGE =
  'Formato no permitido. Usa PNG, JPG, PDF, ZIP, DOC, DOCX, TXT, MD, JSON u otros comunes'

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      const base = path.basename(file.originalname, ext).replace(/[^\w\- ]+/g, '').slice(0, 60)
      cb(null, `${Date.now()}-${base || 'archivo'}${ext}`)
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024, files: 5 }, // máx 20 MB cada archivo, 5 por petición
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (!ALLOWED_EXT.has(ext)) {
      const err = new Error(MESSAGE)
      err.status = 400
      return cb(err)
    }
    cb(null, true)
  },
})

export { upload }