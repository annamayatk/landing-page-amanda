import { eq } from 'drizzle-orm'
import type { IncomingMessage } from 'node:http'

import { requireAdmin } from './lib/auth.js'
import { readJsonBody } from './lib/http.js'
import { getDb } from '../src/db/index.js'
import { anamneseSubmissions, students } from '../src/db/schema.js'

type Res = {
  status: (code: number) => Res
  json: (body: unknown) => void
}

function digitsOnly(s: string): string {
  return s.replace(/\D/g, '')
}

export default async function handler(
  req: IncomingMessage & { method?: string; body?: unknown },
  res: Res,
) {
  if (req.method !== 'POST') {
    res.status(405)
    return res.json({ error: 'Método não permitido' })
  }

  const auth = await requireAdmin(req)
  if (!auth.ok) {
    res.status(auth.status)
    return res.json({ error: auth.message })
  }

  const body = await readJsonBody(req)
  const submissionId = String(body.submissionId ?? '').trim()
  if (!submissionId) {
    res.status(400)
    return res.json({ error: 'submissionId é obrigatório.' })
  }

  const db = getDb()
  const [sub] = await db
    .select()
    .from(anamneseSubmissions)
    .where(eq(anamneseSubmissions.id, submissionId))
  if (!sub) {
    res.status(404)
    return res.json({ error: 'Ficha não encontrada.' })
  }

  const p = sub.payload as Record<string, string | undefined>
  const nome = String(p.nomeCompleto ?? '').trim()
  const email = String(p.email ?? '').trim().toLowerCase()
  const telefone = digitsOnly(String(p.telefone ?? ''))

  if (!nome || !email || !telefone) {
    res.status(400)
    return res.json({
      error:
        'Payload da ficha não tem nome, e-mail ou telefone suficientes para cadastrar.',
    })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400)
    return res.json({ error: 'E-mail na ficha é inválido.' })
  }

  try {
    const [student] = await db
      .insert(students)
      .values({
        nome,
        email,
        telefone,
        status: 'pending',
        notes: 'Criado a partir da ficha de anamnese.',
      })
      .returning()

    await db
      .update(anamneseSubmissions)
      .set({ studentId: student.id })
      .where(eq(anamneseSubmissions.id, submissionId))

    res.status(201)
    return res.json({ student })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('unique') || msg.includes('duplicate')) {
      res.status(409)
      return res.json({
        error:
          'Já existe aluno com este e-mail. Edite o aluno existente ou vincule manualmente.',
      })
    }
    console.error(e)
    res.status(500)
    return res.json({ error: 'Não foi possível criar o aluno.' })
  }
}
