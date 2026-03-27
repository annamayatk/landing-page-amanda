import type { IncomingMessage } from 'node:http'

import { requireAdminSession } from './session.js'

export async function requireAdmin(
  req: Pick<IncomingMessage, 'headers'>,
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  try {
    const ok = await requireAdminSession(req)
    if (!ok) {
      return { ok: false, status: 401, message: 'Não autorizado.' }
    }
    return { ok: true }
  } catch {
    return { ok: false, status: 500, message: 'Erro de autenticação.' }
  }
}
