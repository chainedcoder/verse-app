// One-off copy of all app data from the old Postgres database into MySQL.
//
// Usage:
//   SOURCE_DATABASE_URL="postgresql://..." node --env-file=.env scripts/migrate-postgres-to-mysql.mjs
//
// DATABASE_URL (the MySQL target) must already have the schema applied
// (`npx prisma migrate deploy`) and contain no rows. The source is only read.

import pg from "pg"
import mariadb from "mariadb"
import { buildInsert } from "../lib/dbMigration.js"

const BATCH_SIZE = 500

const sourceUrl = process.env.SOURCE_DATABASE_URL
const targetUrl = process.env.DATABASE_URL

if (!sourceUrl?.startsWith("postgres")) {
  console.error("Set SOURCE_DATABASE_URL to the Postgres database to copy from.")
  process.exit(1)
}
if (!targetUrl?.startsWith("mysql")) {
  console.error("Set DATABASE_URL to the MySQL database to copy into.")
  process.exit(1)
}

// Prisma's DateTime columns are Postgres `timestamp` (no time zone) holding UTC.
// pg would parse them as local time, so keep the raw text and insert it as-is.
const TIMESTAMP_WITHOUT_TZ = 1114

const sourceHost = new URL(sourceUrl).hostname
const source = new pg.Client({
  connectionString: sourceUrl,
  ssl: ["localhost", "127.0.0.1"].includes(sourceHost) ? false : { rejectUnauthorized: false },
  types: {
    getTypeParser: (oid, format) =>
      oid === TIMESTAMP_WITHOUT_TZ ? (value) => value : pg.types.getTypeParser(oid, format),
  },
})
const target = await mariadb.createConnection(targetUrl.replace(/^mysql:/, "mariadb:"))

try {
  await source.connect()

  const tables = (await target.query(
    "SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME <> '_prisma_migrations'"
  )).map((t) => t.name)

  for (const table of tables) {
    const [{ count }] = await target.query(`SELECT COUNT(*) AS count FROM \`${table}\``)
    if (Number(count) > 0) {
      throw new Error(`Target table ${table} already has rows; refusing to copy into a non-empty database.`)
    }
  }

  await target.query("SET FOREIGN_KEY_CHECKS = 0")
  await target.beginTransaction()

  for (const table of tables) {
    const columns = (await target.query(
      "SELECT COLUMN_NAME AS name, DATA_TYPE AS type FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION",
      [table]
    ))

    const exists = await source.query("SELECT to_regclass($1) AS t", [`public."${table}"`])
    if (!exists.rows[0].t) {
      console.log(`${table}: not in source, skipped`)
      continue
    }

    const { rows } = await source.query(`SELECT * FROM "${table}"`)
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const { sql, params } = buildInsert(table, columns, rows.slice(i, i + BATCH_SIZE))
      await target.query(sql, params)
    }
    console.log(`${table}: ${rows.length} rows`)
  }

  await target.commit()
  console.log("Done.")
} catch (error) {
  await target.rollback().catch(() => {})
  console.error(error.message)
  process.exitCode = 1
} finally {
  await target.query("SET FOREIGN_KEY_CHECKS = 1").catch(() => {})
  await target.end()
  await source.end()
}
