// =====================================================================
// routes/users.js
// ---------------------------------------------------------------------
// Endpoints de usuario: perfil (SSO), "Mis Preguntas", expertos y
// actividad reciente.
// =====================================================================
import { Router } from 'express'
import { query } from '../config/db.js'
import ssoAuth from '../middleware/ssoAuth.js'

const router = Router()

// GET /api/users/me  (requiere SSO)
// Usuario autenticado por la Intranet (si no existía, ya se creó).
router.get('/me', ssoAuth, (_req, res) => {
  res.json(req.user)
})

// GET /api/users/me/questions  (requiere SSO)
// Dashboard personal: las 4 métricas superiores + lista de preguntas.
router.get('/me/questions', ssoAuth, async (req, res, next) => {
  try {
    // Métricas: totales, resueltas, en proceso, abiertas.
    const [metrics] = await query(
      `SELECT COUNT(*) AS total,
              COALESCE(SUM(CASE WHEN status = 'resolved'    THEN 1 END), 0) AS resolved,
              COALESCE(SUM(CASE WHEN status = 'in_progress' THEN 1 END), 0) AS in_progress,
              COALESCE(SUM(CASE WHEN status = 'open'        THEN 1 END), 0) AS open
         FROM questions
        WHERE user_id = :0`,
      [req.user.id],
    )

    // Guardadas: interacciones marcadas con el icono de marcador.
    const [saved] = await query(
      `SELECT COUNT(*) AS saved
         FROM saved_items
        WHERE user_id = :0 AND item_type = 'question'`,
      [req.user.id],
    )

    // Lista de preguntas del usuario.
    const questions = await query(
      `SELECT q.id, q.title, q.status, q.votes_count, q.created_at,
              c.name AS category_name, c.color_code AS category_color,
              (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) AS answers_count
         FROM questions q
         JOIN categories c ON c.id = q.category_id
        WHERE q.user_id = :0
        ORDER BY q.created_at DESC`,
      [req.user.id],
    )

    // Preguntas guardadas por el usuario (tab "Guardadas").
    const savedQuestions = await query(
      `SELECT q.id, q.title, q.status, q.votes_count, q.created_at,
              c.name AS category_name, c.color_code AS category_color,
              (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) AS answers_count
         FROM saved_items s
         JOIN questions q ON q.id = s.item_id
         JOIN categories c ON c.id = q.category_id
        WHERE s.user_id = :0 AND s.item_type = 'question'
        ORDER BY s.created_at DESC`,
      [req.user.id],
    )

    res.json({
      metrics: { ...metrics, ...saved },
      questions,
      savedQuestions,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/users/me/interactions  (requiere SSO)
// Ids de preguntas con like y guardadas por el usuario, para que el
// estado de los botones (activo/inactivo) persista al recargar.
router.get('/me/interactions', ssoAuth, async (req, res, next) => {
  try {
    const votedRows = await query(
      `SELECT question_id FROM question_votes WHERE user_id = :0 ORDER BY question_id`,
      [req.user.id],
    )
    const savedRows = await query(
      `SELECT item_id FROM saved_items WHERE user_id = :0 AND item_type = 'question' ORDER BY item_id`,
      [req.user.id],
    )
    res.json({
      voted: votedRows.map((r) => r.question_id),
      saved: savedRows.map((r) => r.item_id),
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/users/me/activity  (requiere SSO)
// Historial de actividad reciente (preguntas + respuestas publicadas).
router.get('/me/activity', ssoAuth, async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT 'pregunta' AS type, title AS text, created_at, id AS ref_id
         FROM questions
        WHERE user_id = :0
       UNION ALL
       SELECT 'respuesta' AS type, body_text AS text, created_at, question_id AS ref_id
         FROM answers
        WHERE user_id = :0
       ORDER BY created_at DESC
       FETCH FIRST 10 ROWS ONLY`,
      [req.user.id, req.user.id],
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

// GET /api/users/experts
// "Expertos Destacados" del sidebar derecho: ordenados por respuestas
// aceptadas y puntos de reputación.
router.get('/experts', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT u.id, u.full_name, u.role_title, u.avatar_initials, u.reputation_points,
              (SELECT COUNT(*) FROM answers a
                WHERE a.user_id = u.id AND a.is_accepted = 1) AS accepted_count
         FROM users u
        ORDER BY accepted_count DESC, u.reputation_points DESC
        FETCH FIRST 6 ROWS ONLY`,
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

export default router