/** Configuração do formulário de anamnese (espelhar chaves em `api/anamnese.ts`). */

export type AnamneseFieldType = 'text' | 'textarea' | 'select'

export type AnamneseField = {
  name: string
  label: string
  type: AnamneseFieldType
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
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
      { name: 'dataNascimento', label: 'Data de nascimento', type: 'text', placeholder: 'DD/MM/AAAA' },
      { name: 'altura', label: 'Altura', type: 'text', placeholder: 'Ex: 1,65 m' },
      {
        name: 'pesoAtual',
        label: 'Peso atual (preferencialmente em jejum)',
        type: 'text',
        placeholder: 'Ex: 70 kg',
      },
      { name: 'email', label: 'E-mail', type: 'text', required: true },
      { name: 'telefone', label: 'Telefone / WhatsApp', type: 'text', placeholder: 'Com DDD' },
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
      },
      {
        name: 'treinaAtualmente',
        label: 'Treina atualmente?',
        type: 'select',
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
      },
      {
        name: 'tempoSemTreinar',
        label: 'Há quanto tempo está sem treinar (se estiver parado)?',
        type: 'text',
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
      },
      {
        name: 'grupamentoEnfatizar',
        label: 'Existe algum grupamento muscular que você gostaria de enfatizar?',
        type: 'textarea',
        placeholder: 'Ex.: glúteos, pernas, costas…',
      },
      {
        name: 'grupamentoDificuldade',
        label: 'Existe algum grupamento que você tem mais dificuldade em desenvolver?',
        type: 'textarea',
      },
    ],
  },
  {
    title: 'Disponibilidade para treino',
    fields: [
      { name: 'diasPorSemana', label: 'Quantos dias por semana pretende treinar?', type: 'text' },
      { name: 'tempoPorTreino', label: 'Quanto tempo você tem disponível para cada treino?', type: 'text' },
      {
        name: 'periodoDia',
        label: 'Em qual período do dia costuma treinar?',
        type: 'select',
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
      { name: 'lesoes', label: 'Possui alguma lesão atual ou antiga? Se sim, qual?', type: 'textarea' },
      { name: 'cirurgias', label: 'Já realizou alguma cirurgia?', type: 'textarea' },
      { name: 'doencasDiagnosticadas', label: 'Possui alguma doença diagnosticada?', type: 'textarea' },
      { name: 'medicamentosContinuos', label: 'Faz uso de algum medicamento contínuo?', type: 'textarea' },
      {
        name: 'doresFrequentes',
        label: 'Sente dores frequentes durante exercícios ou no dia a dia?',
        type: 'textarea',
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
        options: [
          { value: '', label: 'Selecione…' },
          { value: 'boa', label: 'Boa' },
          { value: 'regular', label: 'Regular' },
          { value: 'ruim', label: 'Ruim' },
        ],
      },
      { name: 'horasSono', label: 'Quantas horas costuma dormir por noite?', type: 'text' },
      {
        name: 'trabalhoAtivoSedentario',
        label: 'Seu trabalho é mais ativo ou sedentário?',
        type: 'select',
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
      { name: 'exerciciosEvitar', label: 'Existe algum exercício que você não gosta ou prefere evitar?', type: 'textarea' },
      { name: 'exerciciosGostar', label: 'Existe algum exercício que você gosta muito de fazer?', type: 'textarea' },
      {
        name: 'acessoAcademiaOuCasa',
        label: 'Tem acesso a academia completa ou treina em casa?',
        type: 'textarea',
      },
      {
        name: 'informacoesAdicionais',
        label: 'Gostaria de acrescentar alguma informação importante sobre sua saúde ou rotina?',
        type: 'textarea',
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
