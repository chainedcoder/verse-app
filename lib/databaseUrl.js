import { readFileSync } from "node:fs"
import path from "node:path"

// Shared RDS instances have a small max_connections budget, so keep each
// app process to a modest pool unless the URL asks for something else.
export const DEFAULT_CONNECTION_LIMIT = 10

// The driver gives up after 1s by default, which a TLS handshake to a remote
// database can exceed on a cold start.
export const DEFAULT_CONNECT_TIMEOUT_MS = 10000

// TLS options in Prisma's URL format. The Prisma CLI reads them for migrations;
// the MariaDB driver needs them turned into an `ssl` object instead.
const PRISMA_TLS_OPTIONS = ["sslcert", "sslaccept", "sslidentity", "sslpassword"]

const readFromProjectRoot = (file) => readFileSync(path.resolve(process.cwd(), file), "utf8")

const parseOption = (value) => {
  if (value === "true") return true
  if (value === "false") return false
  if (/^\d+$/.test(value)) return Number(value)
  return value
}

/**
 * Turn a mysql:// DATABASE_URL into a MariaDB pool config for Prisma's adapter.
 * Options already present in the URL win over the defaults. When the URL names a
 * CA bundle with `sslcert` (path from the project root), the connection verifies
 * the server certificate against it.
 * @param {string} databaseUrl
 * @param {{ readFile?: (file: string) => string }} [options]
 * @returns {import("mariadb").PoolConfig}
 */
export function toMariaDbConfig(databaseUrl, { readFile = readFromProjectRoot } = {}) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set")
  }

  const url = new URL(databaseUrl)
  if (url.protocol !== "mysql:" && url.protocol !== "mariadb:") {
    throw new Error(`DATABASE_URL must be a mysql:// URL, got "${url.protocol}//"`)
  }

  const config = {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
    connectionLimit: DEFAULT_CONNECTION_LIMIT,
    connectTimeout: DEFAULT_CONNECT_TIMEOUT_MS,
  }

  for (const [key, value] of url.searchParams) {
    if (!PRISMA_TLS_OPTIONS.includes(key)) {
      config[key] = parseOption(value)
    }
  }

  const caFile = url.searchParams.get("sslcert")
  if (caFile) {
    config.ssl = { ca: readFile(caFile), rejectUnauthorized: true }
  }

  return config
}
