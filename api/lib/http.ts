export type JsonBody = Record<string, unknown>

export async function readJsonBody(req: {
  body?: unknown
}): Promise<JsonBody> {
  const raw = req.body
  if (raw == null) return {}
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as JsonBody
    } catch {
      return {}
    }
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as JsonBody
  }
  return {}
}

export function getQueryId(
  query: Record<string, string | string[] | undefined> | undefined,
  key: string,
): string | undefined {
  if (!query) return undefined
  const v = query[key]
  if (typeof v === 'string') return v
  if (Array.isArray(v) && v[0]) return v[0]
  return undefined
}
