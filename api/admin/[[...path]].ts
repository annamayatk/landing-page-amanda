import bcrypt from 'bcryptjs'
import type { IncomingMessage } from 'node:http'

import { getPathname } from '../lib/pathname.js'
import { readJsonBody } from '../lib/http.js'
import {
  buildClearCookieHeader,
  buildSetCookieHeader,
  createSessionToken,
  getSessionCookieFromReq,
  verifySessionToken,
} from '../lib/session.js'

type Res = {
  status: (code: number) => Res
  setHeader: (name: string, value: string | string[]) => void
  json: (body: unknown) => void
}

function subpath(req: IncomingMessage): string {
  return getPathname(req).replace(/^\/api\/admin\/?/, '').replace(/\/$/, '')
}

export default async function handler(
  req: IncomingMessage & { method?: string; body?: unknown },
  res: Res,
) {
  const seg = subpath(req)

  if (seg === 'login' && req.method === 'POST') {
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

    let token: string
    try {
      token = await createSessionToken()
    } catch {
      res.status(500)
      return res.json({
        error:
          'SESSION_SECRET não configurado na Vercel (mínimo 16 caracteres).',
      })
    }

    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Set-Cookie', buildSetCookieHeader(token, 60 * 60 * 24 * 7))
    res.status(200)
    return res.json({ ok: true })
  }

  if (seg === 'logout' && req.method === 'POST') {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Set-Cookie', buildClearCookieHeader())
    res.status(200)
    return res.json({ ok: true })
  }

  if (seg === 'me' && req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store')
    const token = getSessionCookieFromReq(req)
    if (!token) {
      res.status(200)
      return res.json({ authenticated: false })
    }
    const ok = await verifySessionToken(token)
    res.status(200)
    return res.json({ authenticated: ok })
  }

  res.status(404)
  return res.json({ error: 'Não encontrado.' })
}
