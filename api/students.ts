import { desc } from 'drizzle-orm'
import type { IncomingMessage } from 'node:http'

import { requireAdmin } from './lib/auth.js'
import { readJsonBody } from './lib/http.js'
import { getDb } from '../src/db/index.js'
import { students } from '../src/db/schema.js'

type Res = {
  status: (code: number) => Res
  json: (body: unknown) => void
}

type Status = 'pending' | 'active' | 'inactive'

function parseStatus(v: unknown): Status {
  const s = String(v ?? 'active').toLowerCase()
  if (s === 'pending' || s === 'inactive') return s
  return 'active'
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export default async function handler(
  req: IncomingMessage & { method?: string; body?: unknown },
  res: Res,
) {
  const auth = await requireAdmin(req)
  if (auth.ok === false) {
    res.status(auth.status)
    return res.json({ error: auth.message })
  }

  const db = getDb()

  if (req.method === 'GET') {
    const rows = await db
      .select()
      .from(students)
      .orderBy(desc(students.createdAt))
    res.status(200)
    return res.json({ students: rows })
  }

  if (req.method === 'POST') {
    const body = await readJsonBody(req)
    const nome = String(body.nome ?? '').trim()
    const email = String(body.email ?? '').trim().toLowerCase()
    const telefone = String(body.telefone ?? '').trim()
    if (!nome || !email || !telefone) {
      res.status(400)
      return res.json({ error: 'nome, email e telefone são obrigatórios.' })
    }
    if (!isValidEmail(email)) {
      res.status(400)
      return res.json({ error: 'E-mail inválido.' })
    }

    const notes = body.notes != null ? String(body.notes).trim() || null : null
    const status = parseStatus(body.status)
    const nextDueDate =
      body.nextDueDate != null && String(body.nextDueDate).trim() !== ''
        ? String(body.nextDueDate).slice(0, 10)
        : null

    try {
      const [row] = await db
        .insert(students)
        .values({
          nome,
          email,
          telefone,
          notes,
          status,
          nextDueDate,
        })
        .returning()
      res.status(201)
      return res.json({ student: row })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('unique') || msg.includes('duplicate')) {
        res.status(409)
        return res.json({ error: 'Já existe um aluno com este e-mail.' })
      }
      console.error(e)
      res.status(500)
      return res.json({ error: 'Não foi possível criar o aluno.' })
    }
  }

  res.status(405)
  return res.json({ error: 'Método não permitido' })
}
