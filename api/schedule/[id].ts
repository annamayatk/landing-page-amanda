import { eq } from 'drizzle-orm'
import type { IncomingMessage } from 'node:http'

import { requireAdmin } from '../lib/auth.js'
import { getQueryId } from '../lib/http.js'
import { getDb } from '../../src/db/index.js'
import { scheduleRules } from '../../src/db/schema.js'

type Res = {
  status: (code: number) => Res
  json: (body: unknown) => void
}

type Req = IncomingMessage & {
  method?: string
  query?: Record<string, string | string[]>
  url?: string
}

function getId(req: Req): string | undefined {
  const fromQuery = getQueryId(req.query, 'id')
  if (fromQuery) return fromQuery
  if (req.url) {
    const m = req.url.match(/\/api\/schedule\/([^/?]+)/)
    if (m) return m[1]
  }
  return undefined
}

export default async function handler(req: Req, res: Res) {
  const auth = await requireAdmin(req)
  if (auth.ok === false) {
    res.status(auth.status)
    return res.json({ error: auth.message })
  }

  if (req.method !== 'DELETE') {
    res.status(405)
    return res.json({ error: 'Método não permitido' })
  }

  const id = getId(req)
  if (!id) {
    res.status(400)
    return res.json({ error: 'ID inválido.' })
  }

  const db = getDb()
  const [row] = await db
    .delete(scheduleRules)
    .where(eq(scheduleRules.id, id))
    .returning({ id: scheduleRules.id })

  if (!row) {
    res.status(404)
    return res.json({ error: 'Regra não encontrada.' })
  }
  res.status(200)
  return res.json({ ok: true })
}
