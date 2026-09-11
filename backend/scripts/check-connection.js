// =====================================================================
// scripts/check-connection.js
// ---------------------------------------------------------------------
// Valida la conexión a Oracle Autonomous DB con el wallet de la raíz.
//
// Uso:
//   npm run db:check
//
// Antes de correrlo, completa backend/.env (DB_USER, DB_PASSWORD y
// DB_WALLET_PASSWORD). Mensaje esperado:
//   Conexión exitosa a Oracle Autonomous DB
// =====================================================================
import 'dotenv/config'
import { getPool } from '../src/config/db.js'

async function main() {
  const pool = await getPool()
  const conn = await pool.getConnection()
  try {
    const result = await conn.execute(
      'SELECT banner FROM v$version WHERE ROWNUM = 1',
    )
    console.log('✔ Conexión exitosa a Oracle Autonomous DB')
    console.log(`  ${result.rows[0][0]}`)
    console.log(`  Conectado con: ${process.env.DB_USER} @ ${process.env.DB_CONNECT_STRING || 'preguntasrespuestasnwbd_high'}`)
  } finally {
    await conn.close()
    await pool.close()
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n✖ No se pudo conectar a la base de datos:')
    console.error(`  ${err.message}`)
    console.error('\nRevisa en backend/.env:')
    console.error('  • DB_USER (p.ej. ADMIN)')
    console.error('  • DB_PASSWORD (contraseña del usuario de BD)')
    console.error('  • DB_WALLET_PASSWORD (la que pusiste al descargar el wallet en OCI)')
    process.exit(1)
  })