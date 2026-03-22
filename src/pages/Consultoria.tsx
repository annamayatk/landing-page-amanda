import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

export function Consultoria() {
  return (
    <div className="page">
      <Header />

      <main>
        <section className="section" id="planos">
          <div className="section-header">
            <h2>Planos de consultoria</h2>
            <p>
              Dois formatos para atender diferentes objetivos, mas com o mesmo
              foco: constância, segurança e resultado real.
            </p>
          </div>

          <div className="plans-grid">
            <article className="plan-card">
              <h3>Plano Básico</h3>
              <p className="plan-tagline">
                Ideal para quem quer treinar com estratégia e segurança.
              </p>

              <ul className="plan-features">
                <li>Treino 100% individualizado.</li>
                <li>
                  Planejamento conforme seu objetivo, rotina e nível de
                  condicionamento.
                </li>
                <li>Ajustes periódicos para evolução constante.</li>
              </ul>

              <div className="plan-prices">
                <div>
                  <span className="price-label">Mensal</span>
                  <span className="price-value">R$ 200,00</span>
                  <span className="price-detail">somente treino</span>
                </div>
                <div>
                  <span className="price-label">Trimestral</span>
                  <span className="price-value">R$ 570,00</span>
                  <span className="price-detail">R$ 190/mês</span>
                </div>
                <div>
                  <span className="price-label">Semestral</span>
                  <span className="price-value">R$ 1080,00</span>
                  <span className="price-detail">R$ 180/mês</span>
                </div>
              </div>

              <a
                href="https://wa.me/553284695345?text=Quero%20saber%20mais%20sobre%20o%20Plano%20B%C3%A1sico"
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
                Para quem busca resultados completos e otimizados.
              </p>

              <ul className="plan-features">
                <li>Treino totalmente personalizado.</li>
                <li>Dieta prescrita pelo nutricionista parceiro.</li>
                <li>Estratégia integrada de treino + alimentação.</li>
                <li>
                  Mais organização, mais constância e melhores resultados.
                </li>
              </ul>

              <div className="plan-prices">
                <div>
                  <span className="price-label">Mensal</span>
                  <span className="price-value">R$ 300,00</span>
                  <span className="price-detail">treino + dieta</span>
                </div>
                <div>
                  <span className="price-label">Trimestral</span>
                  <span className="price-value">R$ 840,00</span>
                  <span className="price-detail">R$ 280/mês</span>
                </div>
                <div>
                  <span className="price-label">Semestral</span>
                  <span className="price-value">R$ 1620,00</span>
                  <span className="price-detail">R$ 270/mês</span>
                </div>
              </div>

              <a
                href="https://wa.me/553284695345?text=Quero%20saber%20mais%20sobre%20o%20Plano%20Premium"
                className="btn btn-primary btn-full"
                target="_blank"
                rel="noreferrer"
              >
                Quero o Plano Premium
              </a>
            </article>
          </div>
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
