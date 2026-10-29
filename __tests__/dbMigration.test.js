import { toMysqlDateTime, toMysqlValue, buildInsert, sourceSslConfig } from '../lib/dbMigration'

describe('toMysqlDateTime', () => {
  it('formats dates as UTC DATETIME(3) text', () => {
    expect(toMysqlDateTime(new Date('2026-05-26T18:43:17.423Z'))).toBe('2026-05-26 18:43:17.423')
  })
})

describe('toMysqlValue', () => {
  it('passes nulls through', () => {
    expect(toMysqlValue(null, 'varchar')).toBeNull()
    expect(toMysqlValue(undefined, 'json')).toBeNull()
  })

  it('serialises JSON columns, including former Postgres arrays', () => {
    expect(toMysqlValue({ accent: 'rose' }, 'json')).toBe('{"accent":"rose"}')
    expect(toMysqlValue(['ticket', 'status'], 'json')).toBe('["ticket","status"]')
  })

  it('keeps raw timestamp text unchanged', () => {
    expect(toMysqlValue('2026-05-26 18:43:17.423', 'datetime')).toBe('2026-05-26 18:43:17.423')
  })

  it('converts Date objects and booleans', () => {
    expect(toMysqlValue(new Date('2026-01-02T03:04:05.006Z'), 'datetime')).toBe('2026-01-02 03:04:05.006')
    expect(toMysqlValue(true, 'tinyint')).toBe(1)
    expect(toMysqlValue(false, 'tinyint')).toBe(0)
  })

  it('leaves strings and numbers alone', () => {
    expect(toMysqlValue('Wildflowers 🌸', 'text')).toBe('Wildflowers 🌸')
    expect(toMysqlValue(42, 'int')).toBe(42)
  })
})

describe('buildInsert', () => {
  it('builds a multi-row insert with params in column order', () => {
    const columns = [
      { name: 'id', type: 'varchar' },
      { name: 'tags', type: 'json' },
      { name: 'createdAt', type: 'datetime' },
    ]
    const rows = [
      { id: 'a', tags: ['x'], createdAt: '2026-05-26 18:43:17.423', extra: 'ignored' },
      { id: 'b', tags: null, createdAt: '2026-05-27 00:00:00' },
    ]

    const { sql, params } = buildInsert('LogEvent', columns, rows)

    expect(sql).toBe('INSERT INTO `LogEvent` (`id`, `tags`, `createdAt`) VALUES (?, ?, ?), (?, ?, ?)')
    expect(params).toEqual(['a', '["x"]', '2026-05-26 18:43:17.423', 'b', null, '2026-05-27 00:00:00'])
  })
})

describe('sourceSslConfig', () => {
  it('connects to a local Postgres without TLS', () => {
    expect(sourceSslConfig('postgresql://u:p@localhost:5432/posts')).toBe(false)
    expect(sourceSslConfig('postgresql://u:p@127.0.0.1:5432/posts')).toBe(false)
  })

  it('verifies a remote source against the given CA file', () => {
    const readFile = jest.fn().mockReturnValue('-----BEGIN CERTIFICATE-----')
    const ssl = sourceSslConfig('postgresql://u:p@aws-1-eu-north-1.pooler.supabase.com:5432/postgres', 'supabase.crt', readFile)
    expect(readFile).toHaveBeenCalledWith('supabase.crt')
    expect(ssl).toEqual({ ca: '-----BEGIN CERTIFICATE-----', rejectUnauthorized: true })
  })

  it('still verifies a remote source when no CA file is given', () => {
    expect(sourceSslConfig('postgresql://u:p@db.example.com:5432/postgres')).toEqual({ rejectUnauthorized: true })
  })
})
