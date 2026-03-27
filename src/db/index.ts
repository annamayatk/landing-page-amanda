import { drizzle } from 'drizzle-orm/postgres-js'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'

export type Db = PostgresJsDatabase<typeof schema>

let _db: Db | null = null

/** Cliente Drizzle (lazy) para não exigir DATABASE_URL em build do front. */
export function getDb(): Db {
  if (!_db) {
    const url = process.env.DATABASE_URL?.trim()
    if (!url) {
      throw new Error('DATABASE_URL não está definida.')
    }
    const client = postgres(url, { prepare: false, max: 1 })
    _db = drizzle(client, { schema })
  }
  return _db
}

export * from './schema.js'
