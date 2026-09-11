// =====================================================================
// middleware/ssoAuth.js
// Toma la identidad del usuario desde los headers de la Intranet
// (X-User-ID / X-User-Name / X-User-Role), lo busca en USERS y, si no
// existe, lo auto-registra. Deja el usuario en req.user.
// =====================================================================
import oracledb from 'oracledb'
import { query, getPool } from '../config/db.js'

export default async function ssoAuth(req, res, next) {
  try {
    // --- 1. Identidad desde headers de la Intranet -------------------
    const fullName = String(req.headers['x-user-name'] || 'Erick Pérez').trim()
    const extId = String(
      req.headers['x-user-id'] || `EXT-${fullName.replace(/\s+/g, '-').toUpperCase()}`,
    ).trim()
    const roleTitle = String(req.headers['x-user-role'] || 'Colaborador').trim()

    // --- 2. Buscar si el usuario ya existe ---------------------------
    const rows = await query(
      `SELECT id, external_intranet_id, full_name, role_title, avatar_initials, reputation_points
         FROM users
        WHERE external_intranet_id = :0`,
      [extId],
    )

    if (rows.length === 0) {
      // --- 3. No existe → crear transparentemente ----------------------
      const pool = await getPool()
      const conn = await pool.getConnection()
      try {
        const initials = fullName
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((word) => word[0].toUpperCase())
          .join('')

        const result = await conn.execute(
          `INSERT INTO users (external_intranet_id, full_name, role_title, avatar_initials)
           VALUES (:extId, :fullName, :roleTitle, :initials)
           RETURNING id INTO :id`,
          {
            extId,
            fullName,
            roleTitle,
            initials,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          },
        )
        // COMMIT imprescindible: sin él, Oracle descarta el usuario al cerrar
        // la conexión y las FKs (preguntas/respuestas) fallan con ORA-02291.
        await conn.commit()
        req.user = {
          id: result.outBinds.id[0],
          external_intranet_id: extId,
          full_name: fullName,
          role_title: roleTitle,
          avatar_initials: initials,
          reputation_points: 0,
        }
      } finally {
        await conn.close()
      }
    } else {
      req.user = rows[0]
    }

    next()
  } catch (err) {
    next(err)
  }
}