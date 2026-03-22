/** Configuração do formulário de anamnese (espelhar chaves em `api/anamnese.ts`). */

export type AnamneseFieldType = 'text' | 'textarea' | 'select'

export type AnamneseField = {
  name: string
  label: string
  type: AnamneseFieldType
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  /** Máscara automática (só em inputs de texto) */
  mask?: 'dateDDMMYYYY' | 'alturaMetros' | 'telefoneBR'
}

export type AnamneseSection = {
  title: string
  fields: AnamneseField[]
}

export const ANAMNESE_SECTIONS: AnamneseSection[] = [
  {
    title: 'Dados pessoais',
    fields: [
      { name: 'nomeCompleto', label: 'Nome completo', type: 'text', required: true },
      {
        name: 'dataNascimento',
        label: 'Data de nascimento',
        type: 'text',
        placeholder: 'DD/MM/AAAA',
        mask: 'dateDDMMYYYY',
        required: true,
      },
      {
        name: 'altura',
        label: 'Altura (metros)',
        type: 'text',
        placeholder: 'Só números; a vírgula aparece ao digitar o restante',
        mask: 'alturaMetros',
        required: true,
      },
      {
        name: 'pesoAtual',
        label: 'Peso atual (preferencialmente em jejum)',
        type: 'text',
        placeholder: 'Ex: 70 kg',
        required: true,
      },
      { name: 'email', label: 'E-mail', type: 'text', required: true },
      {
        name: 'telefone',
        label: 'Telefone / WhatsApp',
        type: 'text',
        mask: 'telefoneBR',
        required: true,
      },
      { name: 'profissao', label: 'Profissão', type: 'text' },
    ],
  },
  {
    title: 'Histórico de treinamento',
    fields: [
      {
        name: 'experienciaMusculacao',
        label: 'Você já tem experiência com musculação? Se sim, há quanto tempo treina?',
        type: 'textarea',
        required: true,
      },
      {
        name: 'treinaAtualmente',
        label: 'Treina atualmente?',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Selecione…' },
          { value: 'sim', label: 'Sim' },
          { value: 'nao', label: 'Não' },
        ],
      },
      {
        name: 'acompanhamentoProfissional',
        label: 'Já teve acompanhamento profissional antes?',
        type: 'textarea',
        placeholder: 'Sim / Não e detalhes se quiser',
        required: true,
      },
      {
        name: 'tempoSemTreinar',
        label: 'Há quanto tempo está sem treinar (se estiver parado)?',
        type: 'text',
        required: true,
      },
    ],
  },
  {
    title: 'Objetivos',
    fields: [
      {
        name: 'principalObjetivo',
        label:
          'Qual é o seu principal objetivo com o treinamento? (ex.: hipertrofia, emagrecimento, saúde, condicionamento)',
        type: 'textarea',
        required: true,
      },
      {
        name: 'grupamentoEnfatizar',
        label: 'Existe algum grupamento muscular que você gostaria de enfatizar?',
        type: 'textarea',
        placeholder: 'Ex.: glúteos, pernas, costas…',
        required: true,
      },
      {
        name: 'grupamentoDificuldade',
        label: 'Existe algum grupamento que você tem mais dificuldade em desenvolver?',
        type: 'textarea',
        required: true,
      },
    ],
  },
  {
    title: 'Disponibilidade para treino',
    fields: [
      {
        name: 'diasPorSemana',
        label: 'Quantos dias por semana pretende treinar?',
        type: 'text',
        required: true,
      },
      {
        name: 'tempoPorTreino',
        label: 'Quanto tempo você tem disponível para cada treino?',
        type: 'text',
        required: true,
      },
      {
        name: 'periodoDia',
        label: 'Em qual período do dia costuma treinar?',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Selecione…' },
          { value: 'manha', label: 'Manhã' },
          { value: 'tarde', label: 'Tarde' },
          { value: 'noite', label: 'Noite' },
          { value: 'variado', label: 'Variado' },
        ],
      },
    ],
  },
  {
    title: 'Histórico de saúde',
    fields: [
      {
        name: 'lesoes',
        label: 'Possui alguma lesão atual ou antiga? Se sim, qual?',
        type: 'textarea',
        required: true,
      },
      { name: 'cirurgias', label: 'Já realizou alguma cirurgia?', type: 'textarea', required: true },
      {
        name: 'doencasDiagnosticadas',
        label: 'Possui alguma doença diagnosticada?',
        type: 'textarea',
        required: true,
      },
      {
        name: 'medicamentosContinuos',
        label: 'Faz uso de algum medicamento contínuo?',
        type: 'textarea',
        required: true,
      },
      {
        name: 'doresFrequentes',
        label: 'Sente dores frequentes durante exercícios ou no dia a dia?',
        type: 'textarea',
        required: true,
      },
    ],
  },
  {
    title: 'Estilo de vida',
    fields: [
      {
        name: 'alimentacao',
        label: 'Como você considera sua alimentação atualmente?',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Selecione…' },
          { value: 'boa', label: 'Boa' },
          { value: 'regular', label: 'Regular' },
          { value: 'ruim', label: 'Ruim' },
        ],
      },
      {
        name: 'horasSono',
        label: 'Quantas horas costuma dormir por noite?',
        type: 'text',
        required: true,
      },
      {
        name: 'trabalhoAtivoSedentario',
        label: 'Seu trabalho é mais ativo ou sedentário?',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Selecione…' },
          { value: 'ativo', label: 'Mais ativo' },
          { value: 'sedentario', label: 'Mais sedentário' },
          { value: 'misto', label: 'Misto' },
        ],
      },
    ],
  },
  {
    title: 'Informações adicionais',
    fields: [
      {
        name: 'exerciciosEvitar',
        label: 'Existe algum exercício que você não gosta ou prefere evitar?',
        type: 'textarea',
        required: true,
      },
      {
        name: 'exerciciosGostar',
        label: 'Existe algum exercício que você gosta muito de fazer?',
        type: 'textarea',
        required: true,
      },
      {
        name: 'acessoAcademiaOuCasa',
        label: 'Tem acesso a academia completa ou treina em casa?',
        type: 'textarea',
        required: true,
      },
      {
        name: 'informacoesAdicionais',
        label: 'Gostaria de acrescentar alguma informação importante sobre sua saúde ou rotina?',
        type: 'textarea',
        required: true,
      },
    ],
  },
]

export function buildInitialAnamneseValues(): Record<string, string> {
  const o: Record<string, string> = {}
  for (const s of ANAMNESE_SECTIONS) {
    for (const f of s.fields) {
      o[f.name] = ''
    }
  }
  return o
}

/** Altura com máscara: precisa estar completa (ex.: 1,75), máx. 2,00 m. */
export function isAlturaMetrosCompleta(value: string): boolean {
  return /^[12],\d{2}$/.test(value.trim())
}

/** Telefone BR: 10 dígitos (fixo) ou 11 (celular com 9 após DDD). */
export function isTelefoneBRCompleto(value: string): boolean {
  const d = value.replace(/\D/g, '')
  return d.length === 10 || d.length === 11
}

/** Formato de e-mail simples e prático (local@domínio.ext). */
export function isEmailFormatValid(value: string): boolean {
  const t = value.trim()
  if (!t) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)
}

/** Valida todos os campos com `required: true` (dados pessoais exceto profissão; resto obrigatório). */
export function validateRequiredAnamnese(values: Record<string, string>): string | null {
  for (const section of ANAMNESE_SECTIONS) {
    for (const field of section.fields) {
      if (!field.required) continue
      const v = (values[field.name] ?? '').trim()
      if (!v) {
        return `Preencha o campo: ${field.label}`
      }
      if (field.name === 'email' && !isEmailFormatValid(v)) {
        return 'Digite um e-mail válido (ex.: nome@email.com).'
      }
      if (field.mask === 'alturaMetros' && !isAlturaMetrosCompleta(v)) {
        return 'Preencha a altura com três números (formato final tipo 1,75 m).'
      }
      if (field.mask === 'telefoneBR' && !isTelefoneBRCompleto(v)) {
        return 'Preencha o telefone com DDD: 10 números (fixo) ou 11 (celular).'
      }
    }
  }
  return null
}
