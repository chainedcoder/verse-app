import { toMariaDbConfig, DEFAULT_CONNECTION_LIMIT, DEFAULT_CONNECT_TIMEOUT_MS } from '../lib/databaseUrl'

describe('toMariaDbConfig', () => {
  it('splits a mysql URL into pool options with the default connection limit', () => {
    expect(toMariaDbConfig('mysql://user:pw@db.example.com:3307/verse')).toEqual({
      host: 'db.example.com',
      port: 3307,
      user: 'user',
      password: 'pw',
      database: 'verse',
      connectionLimit: DEFAULT_CONNECTION_LIMIT,
      connectTimeout: DEFAULT_CONNECT_TIMEOUT_MS,
    })
  })

  it('defaults to port 3306', () => {
    expect(toMariaDbConfig('mysql://user:pw@host/verse').port).toBe(3306)
  })

  it('keeps options set in the URL, typed', () => {
    const config = toMariaDbConfig('mysql://user:pw@host/verse?connectionLimit=3&connectTimeout=2000&allowPublicKeyRetrieval=true&timezone=Z')
    expect(config.connectionLimit).toBe(3)
    expect(config.connectTimeout).toBe(2000)
    expect(config.allowPublicKeyRetrieval).toBe(true)
    expect(config.timezone).toBe('Z')
  })

  it('decodes percent-encoded credentials', () => {
    const config = toMariaDbConfig('mysql://us%40er:p%40ss%2Fword@host/verse')
    expect(config.user).toBe('us@er')
    expect(config.password).toBe('p@ss/word')
  })

  it('verifies the server against the CA bundle named by sslcert', () => {
    const readFile = jest.fn().mockReturnValue('-----BEGIN CERTIFICATE-----')
    const config = toMariaDbConfig(
      'mysql://user:pw@host/verse?sslcert=prisma/certs/rds-us-east-2-bundle.pem&sslaccept=strict',
      { readFile }
    )

    expect(readFile).toHaveBeenCalledWith('prisma/certs/rds-us-east-2-bundle.pem')
    expect(config.ssl).toEqual({ ca: '-----BEGIN CERTIFICATE-----', rejectUnauthorized: true })
    expect(config).not.toHaveProperty('sslcert')
    expect(config).not.toHaveProperty('sslaccept')
  })

  it('reads the committed RDS CA bundle from the project root', () => {
    const config = toMariaDbConfig('mysql://user:pw@host/verse?sslcert=prisma/certs/rds-us-east-2-bundle.pem')
    expect(config.ssl.ca).toContain('BEGIN CERTIFICATE')
  })

  it('leaves TLS off when no CA bundle is given', () => {
    expect(toMariaDbConfig('mysql://user:pw@localhost/verse')).not.toHaveProperty('ssl')
  })

  it('rejects a missing URL', () => {
    expect(() => toMariaDbConfig(undefined)).toThrow('DATABASE_URL is not set')
  })

  it('rejects a leftover Postgres URL', () => {
    expect(() => toMariaDbConfig('postgresql://user@localhost:5432/posts')).toThrow('must be a mysql:// URL')
  })
})
