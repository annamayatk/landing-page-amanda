import { useState } from 'react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

type Periodo = 'trimestral' | 'semestral' | 'anual'

const PERIODS: { id: Periodo; label: string; badge?: string }[] = [
  { id: 'trimestral', label: 'Trimestral' },
  { id: 'semestral', label: 'Semestral' },
  { id: 'anual', label: 'Anual', badge: 'Melhor' },
]

const PLANS = {
  basico: {
    name: 'Plano Básico',
    prices: {
      trimestral: { total: 'R$ 570,00', month: 'R$ 190/mês' },
      semestral: { total: 'R$ 1080,00', month: 'R$ 180/mês' },
      anual: { total: 'R$ 1700,00', month: 'R$ 141,67/mês' },
    },
  },
  premium: {
    name: 'Plano Premium',
    prices: {
      trimestral: { total: 'R$ 840,00', month: 'R$ 280/mês' },
      semestral: { total: 'R$ 1500,00', month: 'R$ 250/mês' },
      anual: { total: 'R$ 2500,00', month: 'R$ 208,33/mês' },
    },
  },
} as const

function whatsappHref(planName: string, periodLabel: string) {
  const text = `Quero saber mais sobre o ${planName} ${periodLabel}`
  return `https://wa.me/553284695345?text=${encodeURIComponent(text)}`
}

export function Consultoria() {
  const [periodo, setPeriodo] = useState<Periodo>('anual')
  const periodMeta = PERIODS.find((item) => item.id === periodo)!
  const basico = PLANS.basico.prices[periodo]
  const premium = PLANS.premium.prices[periodo]

  return (
    <div className="page">
      <Header />

      <main>
        <section className="section" id="planos">
          <div className="section-header">
            <h2>Planos de consultoria</h2>
            <p>
              Dois formatos para atender diferentes objetivos, mas com o mesmo
              foco: constância, segurança e resultado real. A consultoria começa
              no trimestral.
            </p>
          </div>

          <div className="plan-period-switch">
            <div className="plan-period-track" role="tablist" aria-label="Período do plano">
              {PERIODS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={periodo === item.id}
                  className={`plan-period-btn${periodo === item.id ? ' is-active' : ''}`}
                  onClick={() => setPeriodo(item.id)}
                >
                  {item.label}
                  {item.badge ? (
                    <span className="plan-period-badge">{item.badge}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <p className="plan-economia">
            {periodo === 'anual' ? 'No anual, o Básico sai a R$ 141,67/mês' : '\u00a0'}
          </p>

          <div className="plans-grid">
            <article className="plan-card">
              <h3>Plano Básico</h3>
              <p className="plan-tagline">
                Ideal para quem quer treinar com estratégia e segurança.
                Somente treino.
              </p>

              <div className="plan-hero-price">
                <div className="plan-hero-price-row">
                  <span className="plan-hero-price-value">
                    {basico.total}
                    <span className="price-asterisk">*</span>
                  </span>
                  <span className="plan-hero-price-period">
                    /{periodMeta.label.toLowerCase()}
                  </span>
                </div>
                <span className="plan-hero-price-sub">{basico.month}</span>
              </div>

              <ul className="plan-features">
                <li>Treino 100% individualizado.</li>
                <li>
                  Planejamento conforme seu objetivo, rotina e nível de
                  condicionamento.
                </li>
                <li>Ajustes periódicos para evolução constante.</li>
              </ul>

              <a
                href={whatsappHref(PLANS.basico.name, periodMeta.label)}
                className="btn btn-outline btn-full"
                target="_blank"
                rel="noreferrer"
              >
                Quero o Plano Básico
              </a>
            </article>

            <article className="plan-card plan-card-featured">
              <div className="plan-badge">Mais completo</div>
              <h3>Plano Premium</h3>
              <p className="plan-tagline">
                Para quem busca resultados completos e otimizados. Treino +
                dieta.
              </p>

              <div className="plan-hero-price">
                <div className="plan-hero-price-row">
                  <span className="plan-hero-price-value">
                    {premium.total}
                    <span className="price-asterisk">*</span>
                  </span>
                  <span className="plan-hero-price-period">
                    /{periodMeta.label.toLowerCase()}
                  </span>
                </div>
                <span className="plan-hero-price-sub">{premium.month}</span>
              </div>

              <ul className="plan-features">
                <li>Treino totalmente personalizado.</li>
                <li>Dieta prescrita pelo nutricionista parceiro.</li>
                <li>Estratégia integrada de treino + alimentação.</li>
                <li>
                  Mais organização, mais constância e melhores resultados.
                </li>
              </ul>

              <a
                href={whatsappHref(PLANS.premium.name, periodMeta.label)}
                className="btn btn-primary btn-full"
                target="_blank"
                rel="noreferrer"
              >
                Quero o Plano Premium
              </a>
            </article>
          </div>

          <p className="plan-installments plan-installments-shared">
            * Parcelamento no cartão, com juros: trimestral em até 3x,
            semestral em até 6x e anual em até 12x.
          </p>
        </section>

        <section className="section section-alt" id="como-funciona">
          <div className="section-header">
            <h2>Como funciona a consultoria</h2>
            <p>
              Do primeiro contato ao ajuste fino do seu plano, você é acompanhado
              de perto para não treinar no escuro.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step">
              <span className="step-number">1</span>
              <h3>Questionário inicial</h3>
              <p>
                Você responde sobre rotina, histórico de lesões, preferências e
                objetivos. Assim, o planejamento já nasce realista.
              </p>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <h3>Montagem do plano</h3>
              <p>
                A Amanda monta seu treino individualizado e, no Plano Premium, o
                João Vitor estrutura sua dieta alinhada ao objetivo.
              </p>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <h3>Acompanhamento e ajustes</h3>
              <p>
                Você envia feedbacks, dúvidas e evoluções. O plano é ajustado
                periodicamente para manter o progresso.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
