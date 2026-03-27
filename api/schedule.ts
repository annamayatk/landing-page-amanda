import { asc, eq } from 'drizzle-orm'
import type { IncomingMessage } from 'node:http'

import { requireAdmin } from './lib/auth.js'
import { readJsonBody } from './lib/http.js'
import { getDb } from '../src/db/index.js'
import { scheduleRules, students } from '../src/db/schema.js'

type Res = {
  status: (code: number) => Res
  json: (body: unknown) => void
}

const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/

function isValidTime(s: string): boolean {
  return TIME_RE.test(s.trim())
}

export default async function handler(
  req: IncomingMessage & { method?: string; body?: unknown },
  res: Res,
) {
  const auth = await requireAdmin(req)
  if (!auth.ok) {
    res.status(auth.status)
    return res.json({ error: auth.message })
  }

  const db = getDb()

  if (req.method === 'GET') {
    const rows = await db
      .select({
        id: scheduleRules.id,
        studentId: scheduleRules.studentId,
        weekday: scheduleRules.weekday,
        startTime: scheduleRules.startTime,
        endTime: scheduleRules.endTime,
        notes: scheduleRules.notes,
        studentNome: students.nome,
      })
      .from(scheduleRules)
      .innerJoin(students, eq(scheduleRules.studentId, students.id))
      .orderBy(asc(scheduleRules.weekday), asc(scheduleRules.startTime))
    res.status(200)
    return res.json({ rules: rows })
  }

  if (req.method === 'POST') {
    const body = await readJsonBody(req)
    const studentId = String(body.studentId ?? '').trim()
    const weekday = Number(body.weekday)
    const startTime = String(body.startTime ?? '').trim()
    const endTime = String(body.endTime ?? '').trim()
    const notes =
      body.notes != null ? String(body.notes).trim() || null : null

    if (!studentId) {
      res.status(400)
      return res.json({ error: 'studentId é obrigatório.' })
    }
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
      res.status(400)
      return res.json({
        error: 'weekday deve ser inteiro de 0 (domingo) a 6 (sábado).',
      })
    }
    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      res.status(400)
      return res.json({
        error: 'Horários devem estar no formato HH:MM (ex.: 08:30).',
      })
    }

    const [student] = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.id, studentId))
    if (!student) {
      res.status(404)
      return res.json({ error: 'Aluno não encontrado.' })
    }

    const [row] = await db
      .insert(scheduleRules)
      .values({
        studentId,
        weekday,
        startTime,
        endTime,
        notes,
      })
      .returning()
    res.status(201)
    return res.json({ rule: row })
  }

  res.status(405)
  return res.json({ error: 'Método não permitido' })
}
