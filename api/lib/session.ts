import type { IncomingMessage } from 'node:http'

import { SignJWT, jwtVerify } from 'jose'

const COOKIE = 'admin_session'

export function getSessionSecret(): Uint8Array {
  const s = process.env.SESSION_SECRET?.trim()
  if (!s || s.length < 16) {
    throw new Error('SESSION_SECRET deve ter pelo menos 16 caracteres.')
  }
  return new TextEncoder().encode(s)
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ sub: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSessionSecret())
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret())
    return payload.sub === 'admin'
  } catch {
    return false
  }
}

function parseCookieHeader(cookieHeader: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const name = part.slice(0, idx).trim()
    const value = part.slice(idx + 1).trim()
    if (!name) continue
    try {
      out[name] = decodeURIComponent(value)
    } catch {
      out[name] = value
    }
  }
  return out
}

export function getSessionCookieFromReq(
  req: Pick<IncomingMessage, 'headers'>,
): string | null {
  const raw = req.headers.cookie
  if (!raw || typeof raw !== 'string') return null
  const cookies = parseCookieHeader(raw)
  return cookies[COOKIE] ?? null
}

function isSecureCookie(): boolean {
  return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
}

export function buildSetCookieHeader(token: string, maxAgeSec: number): string {
  const secure = isSecureCookie() ? '; Secure' : ''
  return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`
}

export function buildClearCookieHeader(): string {
  const secure = isSecureCookie() ? '; Secure' : ''
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
}

export async function requireAdminSession(
  req: Pick<IncomingMessage, 'headers'>,
): Promise<boolean> {
  const cookie = getSessionCookieFromReq(req)
  if (!cookie) return false
  return verifySessionToken(cookie)
}
