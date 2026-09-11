// =====================================================================
// routes/categories.js
// ---------------------------------------------------------------------
// Endpoints de categorías técnicas.
// =====================================================================
import { Router } from 'express'
import { query } from '../config/db.js'

const router = Router()

// GET /api/categories
// Devuelve las categorías con el número de preguntas activas de cada una
// (útil para la pantalla "Categorías Técnicas").
router.get('/', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT c.id,
              c.name,
              c.slug,
              c.description,
              c.color_code,
              (SELECT COUNT(*) FROM questions q WHERE q.category_id = c.id) AS questions_count
         FROM categories c
        ORDER BY c.id`,
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

export default router