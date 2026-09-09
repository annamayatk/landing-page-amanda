export function serverErrorMessage(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e)
  if (msg.includes('DATABASE_URL')) {
    return 'DATABASE_URL não configurada na Vercel.'
  }
  if (
    msg.includes('does not exist') ||
    msg.includes('relation') ||
    msg.includes('column')
  ) {
    return 'Banco desatualizado — rode npm run db:migrate com a DATABASE_URL de produção.'
  }
  return 'Erro interno no servidor.'
}
