export async function readApiJson<T>(r: Response): Promise<T> {
  const text = await r.text()
  if (!text) {
    throw new Error(`Resposta vazia do servidor (${r.status}).`)
  }
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(
      r.status >= 500
        ? 'Erro no servidor — confira DATABASE_URL e se npm run db:migrate foi aplicado no banco de produção.'
        : `Resposta inválida do servidor (${r.status}).`,
    )
  }
}
