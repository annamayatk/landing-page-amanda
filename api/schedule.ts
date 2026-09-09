import { and, asc, eq } from 'drizzle-orm'
import type { IncomingMessage } from 'node:http'

import { requireAdmin } from './lib/auth.js'
import { getQueryId, readJsonBody } from './lib/http.js'
import { getPathname } from './lib/pathname.js'
import { getDb } from '../src/db/index.js'
import {
  classNoShows,
  scheduleExceptions,
  scheduleRules,
  students,
} from '../src/db/schema.js'

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

const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/

function isValidTime(s: string): boolean {
  return TIME_RE.test(s.trim())
}

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s)
}

function todayYmd(): string {
  return new Date().toISOString().slice(0, 10)
}

function queryParam(
  query: Record<string, string | string[]> | undefined,
  key: string,
): string | undefined {
  const v = query?.[key]
  if (Array.isArray(v)) return v[0]
  return v
}

type ScheduleResource = 'rules' | 'exceptions' | 'no-shows'

function getResource(req: Req): ScheduleResource {
  const fromQuery = queryParam(req.query, 'resource')
  if (fromQuery === 'exceptions') return 'exceptions'
  if (fromQuery === 'no-shows') return 'no-shows'

  const path = getPathname(req)
  if (path.endsWith('/exceptions')) return 'exceptions'
  if (path.endsWith('/no-shows')) return 'no-shows'
  return 'rules'
}

function getScheduleId(req: Req): string | undefined {
  const fromQuery = getQueryId(req.query, 'id')
  if (fromQuery) return fromQuery
  if (req.url) {
    const m = req.url.match(/\/api\/schedule\/([^/?]+)/)
    const seg = m?.[1]
    if (seg && seg !== 'exceptions' && seg !== 'no-shows') return seg
  }
  return undefined
}

async function handleExceptions(req: Req, res: Res, db: ReturnType<typeof getDb>) {
  const id = getQueryId(req.query, 'id')

  if (req.method === 'POST' && !id) {
    const body = await readJsonBody(req)
    const ruleId = String(body.ruleId ?? '').trim()
    const originalDate = String(body.originalDate ?? '').slice(0, 10)
    const type = String(body.type ?? '').trim() as 'cancelled' | 'rescheduled'

    if (!ruleId || !isValidDate(originalDate)) {
      res.status(400)
      return res.json({ error: 'ruleId e originalDate são obrigatórios.' })
    }
    if (type !== 'cancelled' && type !== 'rescheduled') {
      res.status(400)
      return res.json({ error: 'type deve ser cancelled ou rescheduled.' })
    }

    const [rule] = await db
      .select()
      .from(scheduleRules)
      .where(eq(scheduleRules.id, ruleId))
    if (!rule) {
      res.status(404)
      return res.json({ error: 'Regra não encontrada.' })
    }

    let newDate: string | null = null
    let newStartTime: string | null = null
    let newEndTime: string | null = null
    let notes: string | null =
      body.notes != null ? String(body.notes).trim() || null : null

    if (type === 'rescheduled') {
      newDate = String(body.newDate ?? '').slice(0, 10)
      newStartTime = String(body.newStartTime ?? '').trim()
      newEndTime = String(body.newEndTime ?? '').trim()
      if (
        !isValidDate(newDate) ||
        !isValidTime(newStartTime) ||
        !isValidTime(newEndTime)
      ) {
        res.status(400)
        return res.json({
          error:
            'Remarque exige newDate, newStartTime e newEndTime válidos.',
        })
      }
    }

    try {
      const [row] = await db
        .insert(scheduleExceptions)
        .values({
          ruleId,
          originalDate,
          type,
          newDate,
          newStartTime,
          newEndTime,
          notes,
        })
        .onConflictDoUpdate({
          target: [
            scheduleExceptions.ruleId,
            scheduleExceptions.originalDate,
          ],
          set: {
            type,
            newDate,
            newStartTime,
            newEndTime,
            notes,
          },
        })
        .returning()

      res.status(201)
      return res.json({ exception: row })
    } catch (e) {
      console.error(e)
      res.status(500)
      return res.json({ error: 'Não foi possível salvar a exceção.' })
    }
  }

  if (req.method === 'DELETE' && id) {
    const [row] = await db
      .delete(scheduleExceptions)
      .where(eq(scheduleExceptions.id, id))
      .returning({ id: scheduleExceptions.id })

    if (!row) {
      res.status(404)
      return res.json({ error: 'Exceção não encontrada.' })
    }
    res.status(200)
    return res.json({ ok: true })
  }

  res.status(405)
  return res.json({ error: 'Método não permitido' })
}

async function handleNoShows(req: Req, res: Res, db: ReturnType<typeof getDb>) {
  if (req.method !== 'POST') {
    res.status(405)
    return res.json({ error: 'Método não permitido' })
  }

  const body = await readJsonBody(req)
  const ruleId = String(body.ruleId ?? '').trim()
  const classDate = String(body.classDate ?? '').slice(0, 10)

  if (!ruleId || !isValidDate(classDate)) {
    res.status(400)
    return res.json({ error: 'ruleId e classDate são obrigatórios.' })
  }

  const [rule] = await db
    .select()
    .from(scheduleRules)
    .where(eq(scheduleRules.id, ruleId))
  if (!rule) {
    res.status(404)
    return res.json({ error: 'Regra não encontrada.' })
  }

  const existing = await db
    .select({ id: classNoShows.id })
    .from(classNoShows)
    .where(
      and(
        eq(classNoShows.ruleId, ruleId),
        eq(classNoShows.classDate, classDate),
      ),
    )

  if (existing.length > 0) {
    await db.delete(classNoShows).where(eq(classNoShows.id, existing[0].id))
    res.status(200)
    return res.json({ toggled: false })
  }

  const [row] = await db
    .insert(classNoShows)
    .values({
      ruleId,
      classDate,
      studentId: rule.studentId,
    })
    .returning()

  res.status(201)
  return res.json({ toggled: true, noShow: row })
}

export default async function handler(req: Req, res: Res) {
  const auth = await requireAdmin(req)
  if (auth.ok === false) {
    res.status(auth.status)
    return res.json({ error: auth.message })
  }

  const db = getDb()
  const resource = getResource(req)

  if (resource === 'exceptions') {
    return handleExceptions(req, res, db)
  }
  if (resource === 'no-shows') {
    return handleNoShows(req, res, db)
  }

  const id = getScheduleId(req)

  if (!id) {
    if (req.method === 'GET') {
      const rules = await db
        .select({
          id: scheduleRules.id,
          studentId: scheduleRules.studentId,
          weekday: scheduleRules.weekday,
          startTime: scheduleRules.startTime,
          endTime: scheduleRules.endTime,
          notes: scheduleRules.notes,
          validFrom: scheduleRules.validFrom,
          validUntil: scheduleRules.validUntil,
          studentNome: students.nome,
        })
        .from(scheduleRules)
        .innerJoin(students, eq(scheduleRules.studentId, students.id))
        .orderBy(asc(scheduleRules.weekday), asc(scheduleRules.startTime))

      const exceptions = await db.select().from(scheduleExceptions)
      const noShows = await db.select().from(classNoShows)

      res.status(200)
      return res.json({ rules, exceptions, noShows })
    }

    if (req.method === 'POST') {
      const body = await readJsonBody(req)
      const studentId = String(body.studentId ?? '').trim()
      const weekday = Number(body.weekday)
      const startTime = String(body.startTime ?? '').trim()
      const endTime = String(body.endTime ?? '').trim()
      const notes =
        body.notes != null ? String(body.notes).trim() || null : null
      const validFrom =
        body.validFrom != null && isValidDate(String(body.validFrom))
          ? String(body.validFrom).slice(0, 10)
          : todayYmd()

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
          validFrom,
        })
        .returning()
      res.status(201)
      return res.json({ rule: row })
    }

    res.status(405)
    return res.json({ error: 'Método não permitido' })
  }

  if (req.method === 'PATCH') {
    const body = await readJsonBody(req)
    const patch: Partial<{
      validUntil: string | null
      notes: string | null
    }> = {}

    if (body.validUntil !== undefined) {
      if (body.validUntil == null || String(body.validUntil).trim() === '') {
        patch.validUntil = null
      } else {
        const v = String(body.validUntil).slice(0, 10)
        if (!isValidDate(v)) {
          res.status(400)
          return res.json({ error: 'validUntil inválido.' })
        }
        patch.validUntil = v
      }
    }
    if (body.notes !== undefined) {
      patch.notes =
        body.notes == null ? null : String(body.notes).trim() || null
    }

    if (Object.keys(patch).length === 0) {
      res.status(400)
      return res.json({ error: 'Nada para atualizar.' })
    }

    const [row] = await db
      .update(scheduleRules)
      .set(patch)
      .where(eq(scheduleRules.id, id))
      .returning()

    if (!row) {
      res.status(404)
      return res.json({ error: 'Regra não encontrada.' })
    }
    res.status(200)
    return res.json({ rule: row })
  }

  if (req.method !== 'DELETE') {
    res.status(405)
    return res.json({ error: 'Método não permitido' })
  }

  const [existing] = await db
    .select({ id: scheduleRules.id, validUntil: scheduleRules.validUntil })
    .from(scheduleRules)
    .where(eq(scheduleRules.id, id))

  if (!existing) {
    res.status(404)
    return res.json({ error: 'Regra não encontrada.' })
  }

  if (existing.validUntil == null) {
    await db
      .update(scheduleRules)
      .set({ validUntil: todayYmd() })
      .where(eq(scheduleRules.id, id))
  } else {
    await db.delete(scheduleRules).where(eq(scheduleRules.id, id))
  }

  res.status(200)
  return res.json({ ok: true })
}
