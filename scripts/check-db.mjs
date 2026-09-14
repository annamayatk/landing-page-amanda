import postgres from 'postgres'

const url = process.env.DATABASE_URL?.trim()
if (!url) {
  console.error('DATABASE_URL não definida.')
  process.exit(1)
}

const sql = postgres(url, { max: 1 })
try {
  const migrations = await sql`
    SELECT id, hash, created_at
    FROM drizzle.__drizzle_migrations
    ORDER BY created_at
  `
  console.log('Migrations registradas:', migrations.length)
  for (const m of migrations) console.log(' -', m.id, m.created_at)

  const tablesAll = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY 1
  `
  console.log('Tabelas public:', tablesAll.map((t) => t.table_name).join(', '))

  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('schedule_exceptions', 'class_no_shows', 'schedule_rules')
    ORDER BY 1
  `
  console.log('Tabelas da agenda:', tables.map((t) => t.table_name).join(', ') || '(nenhuma)')

  const cols = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'schedule_rules'
      AND column_name IN ('valid_from', 'valid_until')
    ORDER BY 1
  `
  console.log('Colunas novas em schedule_rules:', cols.map((c) => c.column_name).join(', ') || '(nenhuma)')
} catch (e) {
  console.error('Erro:', e instanceof Error ? e.message : e)
  process.exit(1)
} finally {
  await sql.end()
}
