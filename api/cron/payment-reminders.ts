import { and, eq, isNotNull, isNull, ne, or } from 'drizzle-orm'
import type { IncomingMessage } from 'node:http'
import { Resend } from 'resend'

import { getDb } from '../../src/db/index.js'
import { students } from '../../src/db/schema.js'

type Res = {
  status: (code: number) => Res
  json: (body: unknown) => void
}

function todaySaoPaulo(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
  }).format(new Date())
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default async function handler(
  req: IncomingMessage & { method?: string; headers?: IncomingMessage['headers'] },
  res: Res,
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405)
    return res.json({ error: 'Método não permitido' })
  }

  const secret = process.env.CRON_SECRET?.trim()
  const auth = req.headers?.authorization
  if (!secret || auth !== `Bearer ${secret}`) {
    res.status(401)
    return res.json({ error: 'Não autorizado' })
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
  if (!apiKey) {
    res.status(500)
    return res.json({ error: 'RESEND_API_KEY não configurada.' })
  }

  const today = todaySaoPaulo()
  const db = getDb()

  const due = await db
    .select()
    .from(students)
    .where(
      and(
        isNotNull(students.nextDueDate),
        eq(students.nextDueDate, today),
        or(
          isNull(students.paymentReminderForDueDate),
          ne(students.paymentReminderForDueDate, students.nextDueDate),
        ),
      ),
    )

  const resend = new Resend(apiKey)
  let sent = 0
  const errors: string[] = []

  for (const s of due) {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:system-ui,sans-serif;font-size:15px;color:#111;line-height:1.5;">
<p>Olá, <strong>${escapeHtml(s.nome)}</strong>,</p>
<p>Este é um lembrete automático: hoje (<strong>${escapeHtml(today)}</strong>) é a data de vencimento do seu pagamento.</p>
<p>Se já tiver quitado, pode desconsiderar esta mensagem.</p>
<p style="margin-top:1.5rem;font-size:13px;color:#6b7280;">Mensagem enviada pelo sistema da sua consultoria.</p>
</body></html>`

    const { error } = await resend.emails.send({
      from,
      to: [s.email],
      subject: `Lembrete de pagamento — ${s.nome}`,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      errors.push(`${s.email}: ${error.message}`)
      continue
    }

    await db
      .update(students)
      .set({
        paymentReminderForDueDate: s.nextDueDate,
        updatedAt: new Date(),
      })
      .where(eq(students.id, s.id))
    sent += 1
  }

  res.status(200)
  return res.json({
    ok: true,
    today,
    checked: due.length,
    sent,
    errors: errors.length ? errors : undefined,
  })
}
