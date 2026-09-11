// =====================================================================
// scripts/migrate.js
// ---------------------------------------------------------------------
// Ejecuta todas las migraciones SQL que estén en db/migrations/.
//
// Uso:
//   npm run db:migrate
//
// Nota: los objetos que ya existan se saltan (migración idempotente),
// así que podemos  volver a ejecutarlo las veces que necesites.
// =====================================================================
import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPool } from '../src/config/db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  const migrationsDir = path.resolve(__dirname, '../db/migrations')
  const files = (await fs.readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort()

  console.log(`Migraciones encontradas: ${files.join(', ') || '(ninguna)'}\n`)

  const pool = await getPool()
  const conn = await pool.getConnection()

  try {
    for (const file of files) {
      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8')

      // Separamos el script en sentencias (una por cada ";" + salto de línea).
      const statements = sql
        .split(/;\s*(?:\r?\n|$)/)
        .map((s) => s.trim())
        .filter(Boolean)

      let ran = 0
      let skipped = 0
      for (const stmt of statements) {
        try {
          await conn.execute(stmt)
          await conn.commit()
          ran += 1
        } catch (err) {
          const message = String(err.message)
          // ORA-00955 / 01430 / 02275 / 01408 -> el objeto ya existía.
          // ORA-00001 -> registro ya insertado por una ejecución anterior (seeds).
          if (/(ORA-00955|ORA-01430|ORA-02275|ORA-01408|ORA-00001)/.test(message)) {
            skipped += 1
          } else {
            throw err
          }
        }
      }
      console.log(`  ${file}: ${ran} sentencia(s) ejecutada(s), ${skipped} omitida(s)`)
    }

    console.log('\nMigraciones completadas con éxito.')
  } finally {
    await conn.close()
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n La migración falló:', err.message)
    process.exit(1)
  })