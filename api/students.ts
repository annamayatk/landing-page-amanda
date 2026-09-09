import { desc, eq } from 'drizzle-orm'
import type { IncomingMessage } from 'node:http'

import { requireAdmin } from './lib/auth.js'
import { getQueryId, readJsonBody } from './lib/http.js'
import { getDb } from '../src/db/index.js'
import { students } from '../src/db/schema.js'

type Res = {
  status: (code: number) => Res
  json: (body: unknown) => void
}

type Req = IncomingMessage & {
  method?: string
  body?: unknown
  query?: Record<string, string | string[]>
  url?: string
}

type Status = 'pending' | 'active' | 'inactive'

function parseStatus(v: unknown): Status {
  const s = String(v ?? 'active').toLowerCase()
  if (s === 'pending' || s === 'inactive') return s
  return 'active'
}

function parseStatusPatch(v: unknown): Status | undefined {
  if (v == null || v === '') return undefined
  const s = String(v).toLowerCase()
  if (s === 'pending' || s === 'active' || s === 'inactive') return s
  return undefined
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

function getStudentId(req: Req): string | undefined {
  const fromQuery = getQueryId(req.query, 'id')
  if (fromQuery) return fromQuery
  if (req.url) {
    const m = req.url.match(/\/api\/students\/([^/?]+)/)
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

  const id = getStudentId(req)
  const db = getDb()

  if (!id) {
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

  if (req.method === 'GET') {
    const [row] = await db.select().from(students).where(eq(students.id, id))
    if (!row) {
      res.status(404)
      return res.json({ error: 'Aluno não encontrado.' })
    }
    res.status(200)
    return res.json({ student: row })
  }

  if (req.method === 'PATCH') {
    const body = await readJsonBody(req)
    const patch: Partial<{
      nome: string
      email: string
      telefone: string
      notes: string | null
      status: Status
      nextDueDate: string | null
      paymentReminderForDueDate: string | null
    }> = {}

    if (body.nome != null) patch.nome = String(body.nome).trim()
    if (body.email != null) {
      patch.email = String(body.email).trim().toLowerCase()
    }
    if (body.telefone != null) patch.telefone = String(body.telefone).trim()
    if (body.notes !== undefined) {
      patch.notes =
        body.notes == null ? null : String(body.notes).trim() || null
    }
    const st = parseStatusPatch(body.status)
    if (st !== undefined) patch.status = st
    if (body.nextDueDate !== undefined) {
      patch.nextDueDate =
        body.nextDueDate == null || String(body.nextDueDate).trim() === ''
          ? null
          : String(body.nextDueDate).slice(0, 10)
    }
    if (body.paymentReminderForDueDate !== undefined) {
      patch.paymentReminderForDueDate =
        body.paymentReminderForDueDate == null ||
        String(body.paymentReminderForDueDate).trim() === ''
          ? null
          : String(body.paymentReminderForDueDate).slice(0, 10)
    }

    if (Object.keys(patch).length === 0) {
      res.status(400)
      return res.json({ error: 'Nada para atualizar.' })
    }

    try {
      const [row] = await db
        .update(students)
        .set({
          ...patch,
          updatedAt: new Date(),
        })
        .where(eq(students.id, id))
        .returning()
      if (!row) {
        res.status(404)
        return res.json({ error: 'Aluno não encontrado.' })
      }
      res.status(200)
      return res.json({ student: row })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('unique') || msg.includes('duplicate')) {
        res.status(409)
        return res.json({ error: 'Já existe um aluno com este e-mail.' })
      }
      console.error(e)
      res.status(500)
      return res.json({ error: 'Não foi possível atualizar o aluno.' })
    }
  }

  if (req.method === 'DELETE') {
    const [row] = await db
      .delete(students)
      .where(eq(students.id, id))
      .returning({ id: students.id })
    if (!row) {
      res.status(404)
      return res.json({ error: 'Aluno não encontrado.' })
    }
    res.status(200)
    return res.json({ ok: true })
  }

  res.status(405)
  return res.json({ error: 'Método não permitido' })
}
