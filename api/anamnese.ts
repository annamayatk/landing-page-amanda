import { Resend } from 'resend'

type Body = Record<string, string | undefined>

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function safeSubjectName(s: string): string {
  return s.replace(/[\r\n]/g, ' ').trim().slice(0, 120)
}

const SECTIONS: { title: string; keys: { key: string; label: string }[] }[] = [
  {
    title: 'Dados pessoais',
    keys: [
      { key: 'nomeCompleto', label: 'Nome completo' },
      { key: 'dataNascimento', label: 'Data de nascimento' },
      { key: 'altura', label: 'Altura (metros)' },
      { key: 'pesoAtual', label: 'Peso atual (preferencialmente em jejum)' },
      { key: 'email', label: 'E-mail' },
      { key: 'telefone', label: 'Telefone / WhatsApp' },
      { key: 'profissao', label: 'Profissão' },
    ],
  },
  {
    title: 'Histórico de treinamento',
    keys: [
      { key: 'experienciaMusculacao', label: 'Experiência com musculação / há quanto tempo treina' },
      { key: 'treinaAtualmente', label: 'Treina atualmente?' },
      { key: 'acompanhamentoProfissional', label: 'Já teve acompanhamento profissional antes?' },
      { key: 'tempoSemTreinar', label: 'Há quanto tempo está sem treinar (se estiver parado)' },
    ],
  },
  {
    title: 'Objetivos',
    keys: [
      { key: 'principalObjetivo', label: 'Principal objetivo com o treinamento' },
      { key: 'grupamentoEnfatizar', label: 'Grupamento muscular a enfatizar' },
      { key: 'grupamentoDificuldade', label: 'Grupamento com mais dificuldade em desenvolver' },
    ],
  },
  {
    title: 'Disponibilidade para treino',
    keys: [
      { key: 'diasPorSemana', label: 'Quantos dias por semana pretende treinar' },
      { key: 'tempoPorTreino', label: 'Tempo disponível para cada treino' },
      { key: 'periodoDia', label: 'Período do dia (manhã, tarde ou noite)' },
    ],
  },
  {
    title: 'Histórico de saúde',
    keys: [
      { key: 'lesoes', label: 'Lesões atuais ou antigas' },
      { key: 'cirurgias', label: 'Cirurgias realizadas' },
      { key: 'doencasDiagnosticadas', label: 'Doenças diagnosticadas' },
      { key: 'medicamentosContinuos', label: 'Medicamentos de uso contínuo' },
      { key: 'doresFrequentes', label: 'Dores frequentes (treino ou dia a dia)' },
    ],
  },
  {
    title: 'Estilo de vida',
    keys: [
      { key: 'alimentacao', label: 'Alimentação atual (boa, regular ou ruim)' },
      { key: 'horasSono', label: 'Horas de sono por noite' },
      { key: 'trabalhoAtivoSedentario', label: 'Trabalho mais ativo ou sedentário' },
    ],
  },
  {
    title: 'Informações adicionais',
    keys: [
      { key: 'exerciciosEvitar', label: 'Exercícios que prefere evitar' },
      { key: 'exerciciosGostar', label: 'Exercícios que gosta muito de fazer' },
      { key: 'acessoAcademiaOuCasa', label: 'Acesso a academia completa ou treino em casa' },
      { key: 'informacoesAdicionais', label: 'Outras informações importantes (saúde ou rotina)' },
    ],
  },
]

function buildHtmlEmail(body: Body): string {
  const rows: string[] = []
  for (const section of SECTIONS) {
    rows.push(`<h2 style="margin:1.25rem 0 0.5rem;font-size:1rem;color:#111;">${escapeHtml(section.title)}</h2>`)
    rows.push('<table style="border-collapse:collapse;width:100%;max-width:640px;">')
    for (const { key, label } of section.keys) {
      const v = (body[key] ?? '').trim() || '—'
      rows.push(
        `<tr><td style="vertical-align:top;padding:6px 8px;border:1px solid #e5e7eb;background:#f9fafb;width:38%;font-weight:600;">${escapeHtml(label)}</td><td style="vertical-align:top;padding:6px 8px;border:1px solid #e5e7eb;">${escapeHtml(v).replace(/\n/g, '<br/>')}</td></tr>`,
      )
    }
    rows.push('</table>')
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:system-ui,sans-serif;font-size:14px;color:#111;line-height:1.45;">
<p style="margin:0 0 1rem;">Nova resposta do formulário de <strong>anamnese — consultoria</strong>.</p>
${rows.join('')}
<p style="margin-top:1.5rem;font-size:12px;color:#6b7280;">Enviado pelo site em ${escapeHtml(new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }))}</p>
</body></html>`
}

// Vercel Node.js serverless
export default async function handler(req: {
  method?: string
  body?: Body | string
}, res: {
  status: (code: number) => typeof res
  json: (body: unknown) => void
}) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const apiKey = process.env.RESEND_API_KEY
  const toRaw = process.env.ANAMNESE_TO_EMAIL
  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

  /** Um ou vários destinatários: `amanda@email.com` ou `amanda@email.com, backup@email.com` */
  const toList =
    toRaw
      ?.split(',')
      .map((s) => s.trim())
      .filter(Boolean) ?? []

  if (!apiKey) {
    return res.status(500).json({ error: 'Serviço de e-mail não configurado.' })
  }
  if (toList.length === 0) {
    return res.status(500).json({ error: 'E-mail de destino não configurado.' })
  }

  let body: Body
  try {
    const raw = req.body
    body =
      typeof raw === 'string'
        ? (JSON.parse(raw) as Body)
        : raw && typeof raw === 'object'
          ? (raw as Body)
          : {}
  } catch {
    return res.status(400).json({ error: 'Corpo da requisição inválido.' })
  }

  // Anti-bot simples (campo oculto deve ficar vazio)
  if (body._honeypot && String(body._honeypot).trim() !== '') {
    return res.status(200).json({ ok: true })
  }

  /** Obrigatórios: todos os campos exceto estes — alinhado com `anamneseForm.ts`. */
  const OPCIONAL = new Set(['profissao', 'tempoSemTreinar'])
  for (const section of SECTIONS) {
    for (const { key, label } of section.keys) {
      if (OPCIONAL.has(key)) continue
      if (!(body[key] ?? '').trim()) {
        return res.status(400).json({ error: `Campo obrigatório: ${label}` })
      }
    }
  }

  const diasSemana = String(body.diasPorSemana ?? '').trim()
  if (!/^[1-7]$/.test(diasSemana)) {
    return res.status(400).json({
      error: 'Dias por semana deve ser um valor entre 1 e 7.',
    })
  }

  const emailVal = (body.email ?? '').trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
    return res.status(400).json({ error: 'E-mail inválido. Use um formato como nome@email.com.' })
  }

  const alturaVal = (body.altura ?? '').trim()
  const alturaCm = (() => {
    if (!/^[12],\d{2}$/.test(alturaVal)) return null
    return parseInt(alturaVal[0], 10) * 100 + parseInt(alturaVal.slice(2), 10)
  })()
  if (alturaCm === null || alturaCm < 100 || alturaCm > 290) {
    return res.status(400).json({
      error: 'Altura inválida. Use três números entre 1,00 m e 2,90 m (ex.: 1,75).',
    })
  }

  const telDigits = String(body.telefone ?? '').replace(/\D/g, '')
  if (telDigits.length !== 10 && telDigits.length !== 11) {
    return res.status(400).json({
      error: 'Telefone inválido: use DDD + número (10 dígitos fixo ou 11 celular).',
    })
  }

  const nome = (body.nomeCompleto ?? '').trim()
  const emailAluno = (body.email ?? '').trim()

  const resend = new Resend(apiKey)
  const html = buildHtmlEmail(body)
  const subject = `Nova ficha de anamnese — ${safeSubjectName(nome)}`
  const replyToOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAluno)

  const { error } = await resend.emails.send({
    from,
    to: toList,
    ...(replyToOk ? { replyTo: emailAluno } : {}),
    subject,
    html,
  })

  if (error) {
    console.error('Resend error:', error)
    return res.status(502).json({
      error: 'Não foi possível enviar o e-mail. Tente novamente ou fale com a Amanda pelo WhatsApp.',
    })
  }

  return res.status(200).json({ ok: true })
}
