import { useState } from 'react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

type Frequencia =
  | 'avulsa'
  | '1x'
  | '2x'
  | '3x'
  | '4x'
  | '5x'

const FREQUENCIES: { id: Frequencia; label: string; suffix: string; hint: string }[] =
  [
    {
      id: 'avulsa',
      label: 'Aula avulsa',
      suffix: 'por aula',
      hint: 'Pague apenas a aula que fizer.',
    },
    {
      id: '1x',
      label: '1x por semana',
      suffix: '/mês',
      hint: '1 aula por semana',
    },
    {
      id: '2x',
      label: '2x por semana',
      suffix: '/mês',
      hint: '2 aulas por semana',
    },
    {
      id: '3x',
      label: '3x por semana',
      suffix: '/mês',
      hint: '3 aulas por semana',
    },
    {
      id: '4x',
      label: '4x por semana',
      suffix: '/mês',
      hint: '4 aulas por semana',
    },
    {
      id: '5x',
      label: '5x por semana',
      suffix: '/mês',
      hint: '5 aulas por semana',
    },
  ]

const PLANS = {
  individual: {
    name: 'Atendimento Individual',
    prices: {
      avulsa: 'R$ 100,00',
      '1x': 'R$ 320,00',
      '2x': 'R$ 640,00',
      '3x': 'R$ 960,00',
      '4x': 'R$ 1280,00',
      '5x': 'R$ 1600,00',
    },
  },
  dupla: {
    name: 'Atendimento Dupla',
    prices: {
      avulsa: 'R$ 150,00',
      '1x': 'R$ 480,00',
      '2x': 'R$ 960,00',
      '3x': 'R$ 1440,00',
      '4x': 'R$ 1920,00',
      '5x': 'R$ 2400,00',
    },
  },
} as const

function whatsappHref(planName: string, frequencyLabel: string) {
  const text = `Quero saber mais sobre o ${planName} (${frequencyLabel})`
  return `https://wa.me/553284695345?text=${encodeURIComponent(text)}`
}

export function Presencial() {
  const [frequencia, setFrequencia] = useState<Frequencia>('2x')
  const freqMeta = FREQUENCIES.find((item) => item.id === frequencia)!
  const individual = PLANS.individual.prices[frequencia]
  const dupla = PLANS.dupla.prices[frequencia]

  return (
    <div className="page">
      <Header />

      <main>
        <section className="section" id="planos">
          <div className="section-header scroll-reveal" id="planos-personal">
            <h2>Planos de personal</h2>
            <p>
              Treinamento com acompanhamento presencial, com orientação
              individual durante toda a execução dos exercícios. Escolha a
              frequência e o formato: sozinha ou em dupla.
            </p>
          </div>

          <div className="plan-period-switch">
            <div
              className="plan-period-track plan-period-track--compact"
              role="tablist"
              aria-label="Frequência do plano"
            >
              {FREQUENCIES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={frequencia === item.id}
                  className={`plan-period-btn${frequencia === item.id ? ' is-active' : ''}`}
                  onClick={() => setFrequencia(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="plans-grid">
            <article className="plan-card scroll-reveal">
              <h3>Individual</h3>
              <p className="plan-tagline">
                Atenção 100% em você. Somente em Itaipava (Petrópolis - RJ).
              </p>

              <div className="plan-hero-price">
                <div className="plan-hero-price-row">
                  <span className="plan-hero-price-value">{individual}</span>
                  <span className="plan-hero-price-period">{freqMeta.suffix}</span>
                </div>
                <span className="plan-hero-price-sub">
                  {frequencia === 'avulsa'
                    ? 'Uma aula, quando você quiser'
                    : 'Valor mensal'}
                </span>
              </div>

              <ul className="plan-features">
                <li>Orientação individual em toda a execução.</li>
                <li>Treino adaptado ao seu objetivo e evolução.</li>
              </ul>

              <a
                href={whatsappHref(PLANS.individual.name, freqMeta.hint)}
                className="btn btn-outline btn-full"
                target="_blank"
                rel="noreferrer"
              >
                Quero Individual
              </a>
            </article>

            <article className="plan-card plan-card-featured scroll-reveal">
              <div className="plan-badge">Melhor custo</div>
              <h3>Dupla</h3>
              <p className="plan-tagline">
                Treine com alguém. Mesmo acompanhamento, melhor custo. Somente
                em Itaipava (Petrópolis - RJ).
              </p>

              <div className="plan-hero-price">
                <div className="plan-hero-price-row">
                  <span className="plan-hero-price-value">{dupla}</span>
                  <span className="plan-hero-price-period">{freqMeta.suffix}</span>
                </div>
                <span className="plan-hero-price-sub">
                  {frequencia === 'avulsa'
                    ? 'Uma aula para a dupla'
                    : 'Valor mensal'}
                </span>
              </div>

              <ul className="plan-features">
                <li>Acompanhamento presencial para duas pessoas.</li>
                <li>Treine com uma amiga ou familiar.</li>
                <li>Melhor custo por pessoa.</li>
              </ul>

              <a
                href={whatsappHref(PLANS.dupla.name, freqMeta.hint)}
                className="btn btn-primary btn-full"
                target="_blank"
                rel="noreferrer"
              >
                Quero Dupla
              </a>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
