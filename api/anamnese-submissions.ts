import { desc } from 'drizzle-orm'
import type { IncomingMessage } from 'node:http'

import { requireAdmin } from './lib/auth.js'
import { getDb } from '../src/db/index.js'
import { anamneseSubmissions } from '../src/db/schema.js'

type Res = {
  status: (code: number) => Res
  json: (body: unknown) => void
}

export default async function handler(
  req: IncomingMessage & { method?: string },
  res: Res,
) {
  if (req.method !== 'GET') {
    res.status(405)
    return res.json({ error: 'Método não permitido' })
  }

  const auth = await requireAdmin(req)
  if (!auth.ok) {
    res.status(auth.status)
    return res.json({ error: auth.message })
  }

  const db = getDb()
  const rows = await db
    .select({
      id: anamneseSubmissions.id,
      payload: anamneseSubmissions.payload,
      studentId: anamneseSubmissions.studentId,
      createdAt: anamneseSubmissions.createdAt,
    })
    .from(anamneseSubmissions)
    .orderBy(desc(anamneseSubmissions.createdAt))

  res.status(200)
  return res.json({ submissions: rows })
}
