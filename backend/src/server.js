// =====================================================================
// server.js
// ---------------------------------------------------------------------
// Punto de entrada de la API Nextword.
// Levanta el servidor Express y monta todas las rutas.
// =====================================================================
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPool } from './config/db.js'
import categoriesRoutes from './routes/categories.js'
import questionsRoutes from './routes/questions.js'
import usersRoutes from './routes/users.js'
import projectsRoutes, { UPLOAD_DIR } from './routes/projects.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 4000

// Middlewares globales
app.use(cors()) // permite llamadas desde el frontend (Vite)
app.use(express.json({ limit: '2mb' })) // parsea el body JSON

// Archivos adjuntos de proyectos subidos con multer (descarga directa)
app.use('/api/uploads', express.static(UPLOAD_DIR))

// GET /api/health
// Comprueba que el backend responde y que la conexión a Oracle funciona.
app.get('/api/health', async (_req, res, next) => {
  try {
    const pool = await getPool()
    const conn = await pool.getConnection()
    try {
      const result = await conn.execute('SELECT 1 AS ok FROM dual')
      const ok = result.rows[0][0]
      res.json({ ok: ok === 1, service: 'nextword-backend', database: 'Oracle Autonomous DB' })
    } finally {
      await conn.close()
    }
  } catch (err) {
    next(err)
  }
})

// Módulos de rutas (cada uno cuelga de su prefijo /api/...)
app.use('/api/categories', categoriesRoutes)
app.use('/api/questions', questionsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/projects', projectsRoutes)

// 404 para rutas desconocidas
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

// Manejo centralizado de errores
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err)
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' })
})

app.listen(PORT, () => {
  console.log(`✔ API Nextword escuchando en http://localhost:${PORT}`)
  console.log(`  Health check: http://localhost:${PORT}/api/health`)
})