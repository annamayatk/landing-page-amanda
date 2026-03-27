import type { IncomingMessage } from 'node:http'

import {
  getSessionCookieFromReq,
  verifySessionToken,
} from '../lib/session.js'

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

  const token = getSessionCookieFromReq(req)
  if (!token) {
    res.status(200)
    return res.json({ authenticated: false })
  }

  const ok = await verifySessionToken(token)
  res.status(200)
  return res.json({ authenticated: ok })
}
