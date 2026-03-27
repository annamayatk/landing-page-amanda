import { buildClearCookieHeader } from '../lib/session.js'

type Res = {
  status: (code: number) => Res
  setHeader: (name: string, value: string | string[]) => void
  json: (body: unknown) => void
}

export default async function handler(
  req: { method?: string },
  res: Res,
) {
  if (req.method !== 'POST') {
    res.status(405)
    return res.json({ error: 'Método não permitido' })
  }
  res.setHeader('Set-Cookie', buildClearCookieHeader())
  res.status(200)
  return res.json({ ok: true })
}
