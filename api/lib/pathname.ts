import type { IncomingMessage } from 'node:http'

export function getPathname(req: Pick<IncomingMessage, 'url'>): string {
  const u = req.url ?? '/'
  const i = u.indexOf('?')
  return i === -1 ? u : u.slice(0, i)
}
