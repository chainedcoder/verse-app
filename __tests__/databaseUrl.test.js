import { withPoolDefaults, DEFAULT_CONNECTION_LIMIT } from '../lib/databaseUrl'

describe('withPoolDefaults', () => {
  it('adds the default connection limit to a mysql URL', () => {
    const url = new URL(withPoolDefaults('mysql://user:pw@db.example.com:3306/verse'))
    expect(url.protocol).toBe('mysql:')
    expect(url.hostname).toBe('db.example.com')
    expect(url.pathname).toBe('/verse')
    expect(url.searchParams.get('connectionLimit')).toBe(String(DEFAULT_CONNECTION_LIMIT))
  })

  it('keeps a connection limit and other options set in the URL', () => {
    const url = new URL(withPoolDefaults('mysql://user:pw@host/verse?connectionLimit=3&ssl=true'))
    expect(url.searchParams.get('connectionLimit')).toBe('3')
    expect(url.searchParams.get('ssl')).toBe('true')
  })

  it('preserves percent-encoded passwords', () => {
    const url = new URL(withPoolDefaults('mysql://user:p%40ss%2Fword@host/verse'))
    expect(decodeURIComponent(url.password)).toBe('p@ss/word')
  })

  it('rejects a missing URL', () => {
    expect(() => withPoolDefaults(undefined)).toThrow('DATABASE_URL is not set')
  })

  it('rejects a leftover Postgres URL', () => {
    expect(() => withPoolDefaults('postgresql://user@localhost:5432/posts')).toThrow('must be a mysql:// URL')
  })
})
