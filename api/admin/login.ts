import bcrypt from 'bcryptjs'

import { readJsonBody } from '../lib/http.js'
import { buildSetCookieHeader, createSessionToken } from '../lib/session.js'

type Res = {
  status: (code: number) => Res
  setHeader: (name: string, value: string | string[]) => void
  json: (body: unknown) => void
}

export default async function handler(
  req: { method?: string; body?: unknown },
  res: Res,
) {
  if (req.method !== 'POST') {
    res.status(405)
    return res.json({ error: 'Método não permitido' })
  }

  const body = await readJsonBody(req)
  const password = String(body.password ?? '')

  const hash = process.env.ADMIN_PASSWORD_HASH?.trim()
  const plain = process.env.ADMIN_PASSWORD?.trim()

  let ok = false
  if (hash) {
    ok = await bcrypt.compare(password, hash)
  } else if (plain) {
    ok = password === plain
  } else {
    res.status(500)
    return res.json({
      error:
        'Painel não configurado: defina ADMIN_PASSWORD ou ADMIN_PASSWORD_HASH.',
    })
  }

  if (!ok) {
    res.status(401)
    return res.json({ error: 'Senha inválida.' })
  }

  const token = await createSessionToken()
  res.setHeader('Set-Cookie', buildSetCookieHeader(token, 60 * 60 * 24 * 7))
  res.status(200)
  return res.json({ ok: true })
}
