import { readFileSync } from 'node:fs'
import postgres from 'postgres'

const url = process.env.DATABASE_URL?.trim()
if (!url) {
  console.error('DATABASE_URL não definida.')
  process.exit(1)
}

const sqlFile = new URL('../drizzle/0001_schedule_calendar.sql', import.meta.url)
const raw = readFileSync(sqlFile, 'utf8')
const statements = raw
  .split('--> statement-breakpoint')
  .map((s) => s.trim())
  .filter(Boolean)

const sql = postgres(url, { max: 1 })
try {
  for (const statement of statements) {
    console.log('Executando:', statement.slice(0, 60).replace(/\s+/g, ' '), '...')
    await sql.unsafe(statement)
  }
  console.log('Migration 0001 aplicada com sucesso.')
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e)
  if (msg.includes('already exists')) {
    console.log('Parece que parte da migration já existia — confira com npm run db:check')
  } else {
    console.error('Erro:', msg)
    process.exit(1)
  }
} finally {
  await sql.end()
}
