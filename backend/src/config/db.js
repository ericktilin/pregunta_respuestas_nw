// =====================================================================
// config/db.js
// Pool único de Oracle Autonomous DB usando la wallet (modo thin).
// Expone helpers: query(), execute() y transaction().
// =====================================================================
import oracledb from 'oracledb'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Carpeta del wallet (raíz del repositorio: ./oracle_wallet)
export const WALLET_DIR = path.resolve(__dirname, '../../../oracle_wallet')

// Alias de conexión que se leerá desde tnsnames.ora
export const CONNECT_STRING =
  process.env.DB_CONNECT_STRING || 'preguntasrespuestasnwbd_high'

// Las columnas CLOB (por ejemplo body_text) llegarán como texto plano
// en lugar de un objeto Lob, 
oracledb.fetchAsString = [oracledb.CLOB]

// El pool se crea una sola vez  y se reutiliza.
let poolPromise = null

export function getPool() {
  if (!poolPromise) {
    poolPromise = oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: CONNECT_STRING,
      configDir: WALLET_DIR, // contiene tnsnames.ora
      walletLocation: WALLET_DIR, // contiene ewallet.pem
      walletPassword: process.env.DB_WALLET_PASSWORD || undefined, // password del wallet OCI
      poolMin: 1,
      poolMax: 10,
    })
  }
  return poolPromise
}

// SELECT sencillo-> devuelve array de objetos normalizados.
export async function query(sql, binds = []) {
  const pool = await getPool()
  const conn = await pool.getConnection()
  try {
    const result = await conn.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    })
    return (result.rows || []).map(normalizeRow)
  } finally {
    await conn.close()
  }
}

// INSERT / UPDATE / DELETE sencillos → ejecuta y HACE COMMIT, y devuelve
// el Result de oracledb (result.rowsAffected, result.outBinds, etc.).
// El COMMIT es imprescindible: si la conexión se cierra sin commit,
// Oracle descarta los cambios.
export async function execute(sql, binds, options = {}) {
  const pool = await getPool()
  const conn = await pool.getConnection()
  try {
    const result = await conn.execute(sql, binds, options)
    await conn.commit()
    return result
  } finally {
    await conn.close()
  }
}

// Transacción: se da una conexión al callback `fn`.
// Si algo falla → ROLLBACK; si todo sale bien → COMMIT.
export async function transaction(fn) {
  const pool = await getPool()
  const conn = await pool.getConnection()
  try {
    const output = await fn(conn)
    await conn.commit()
    return output
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    await conn.close()
  }
}

// Convierte filas de Oracle a objetos "limpios" para JSON:
//  - claves en minúsculas
//  - fechas convertidas a string ISO
function normalizeRow(row) {
  const out = {}
  for (const key of Object.keys(row)) {
    const value = row[key]
    out[key.toLowerCase()] =
      value instanceof Date
        ? new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString()
        : value
  }
  return out
}