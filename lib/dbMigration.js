// Helpers for copying rows from the old Postgres database into MySQL.
// Used by scripts/migrate-postgres-to-mysql.mjs.

/**
 * Format a Date the way MySQL DATETIME(3) expects it, in UTC
 * (Prisma stores and reads all DateTime values as UTC).
 * @param {Date} date
 * @returns {string}
 */
export function toMysqlDateTime(date) {
  return date.toISOString().replace("T", " ").replace("Z", "")
}

/**
 * Convert one Postgres value into something the MySQL driver can insert.
 * @param {unknown} value
 * @param {string} mysqlType - DATA_TYPE from information_schema (e.g. "json", "datetime")
 */
export function toMysqlValue(value, mysqlType) {
  if (value === null || value === undefined) return null
  if (value instanceof Date) return toMysqlDateTime(value)
  if (mysqlType === "json") return JSON.stringify(value)
  if (typeof value === "boolean") return value ? 1 : 0
  return value
}

/**
 * Build a multi-row INSERT for a batch of rows.
 * @param {string} table
 * @param {{ name: string, type: string }[]} columns
 * @param {Record<string, unknown>[]} rows
 * @returns {{ sql: string, params: unknown[] }}
 */
export function buildInsert(table, columns, rows) {
  const columnList = columns.map((c) => `\`${c.name}\``).join(", ")
  const rowPlaceholder = `(${columns.map(() => "?").join(", ")})`
  const sql = `INSERT INTO \`${table}\` (${columnList}) VALUES ${rows.map(() => rowPlaceholder).join(", ")}`
  const params = rows.flatMap((row) => columns.map((c) => toMysqlValue(row[c.name], c.type)))
  return { sql, params }
}
