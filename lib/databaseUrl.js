// Shared RDS instances have a small max_connections budget, so keep each
// app process to a modest pool unless the URL asks for something else.
export const DEFAULT_CONNECTION_LIMIT = 10

/**
 * Prepare a mysql:// DATABASE_URL for the MariaDB driver used by Prisma.
 * Options already present in the URL win over the defaults.
 * @param {string} databaseUrl
 * @returns {string}
 */
export function withPoolDefaults(databaseUrl) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set")
  }

  const url = new URL(databaseUrl)
  if (url.protocol !== "mysql:" && url.protocol !== "mariadb:") {
    throw new Error(`DATABASE_URL must be a mysql:// URL, got "${url.protocol}//"`)
  }

  if (!url.searchParams.has("connectionLimit")) {
    url.searchParams.set("connectionLimit", String(DEFAULT_CONNECTION_LIMIT))
  }

  return url.toString()
}
