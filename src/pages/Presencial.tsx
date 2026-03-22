import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

export function Presencial() {
  return (
    <div className="page">
      <Header />

      <main>
        <section className="section" id="planos">
          <div className="section-header" id="planos-personal">
            <h2>Planos de personal</h2>
            <p>
              Treinamento com acompanhamento presencial, com orientação
              individual durante toda a execução dos exercícios.
            </p>
          </div>

          <div className="plans-grid">
            <article className="plan-card">
              <h3>Atendimento Presencial - Individual</h3>
              <p className="plan-tagline">
                Somente em ITAIPAVA (Petrópolis - RJ).
              </p>

              <div className="plan-prices">
                <div>
                  <span className="price-label">Aula avulsa</span>
                  <span className="price-value">R$ 100,00</span>
                </div>
                <div>
                  <span className="price-label">1x por semana</span>
                  <span className="price-value">R$ 320,00</span>
                </div>
                <div>
                  <span className="price-label">2x por semana</span>
                  <span className="price-value">R$ 640,00</span>
                </div>
                <div>
                  <span className="price-label">3x por semana</span>
                  <span className="price-value">R$ 960,00</span>
                </div>
                <div>
                  <span className="price-label">4x por semana</span>
                  <span className="price-value">R$ 1280,00</span>
                </div>
                <div>
                  <span className="price-label">5x por semana</span>
                  <span className="price-value">R$ 1600,00</span>
                </div>
              </div>

              <a
                href="https://wa.me/553284695345?text=Quero%20atendimento%20presencial%20Individual"
                className="btn btn-outline btn-full"
                target="_blank"
                rel="noreferrer"
              >
                Quero Atendimento Presencial (Individual)
              </a>
            </article>

            <article className="plan-card plan-card-featured">
              <div className="plan-badge">Melhor preço</div>
              <h3>Atendimento Presencial - Dupla</h3>
              <p className="plan-tagline">
                Somente em ITAIPAVA (Petrópolis - RJ).
              </p>

              <div className="plan-prices">
                <div>
                  <span className="price-label">Aula avulsa</span>
                  <span className="price-value">R$ 150,00</span>
                </div>
                <div>
                  <span className="price-label">1x por semana</span>
                  <span className="price-value">R$ 480,00</span>
                </div>
                <div>
                  <span className="price-label">2x por semana</span>
                  <span className="price-value">R$ 960,00</span>
                </div>
                <div>
                  <span className="price-label">3x por semana</span>
                  <span className="price-value">R$ 1440,00</span>
                </div>
                <div>
                  <span className="price-label">4x por semana</span>
                  <span className="price-value">R$ 1920,00</span>
                </div>
                <div>
                  <span className="price-label">5x por semana</span>
                  <span className="price-value">R$ 2400,00</span>
                </div>
              </div>

              <a
                href="https://wa.me/553284695345?text=Quero%20atendimento%20presencial%20Dupla"
                className="btn btn-primary btn-full"
                target="_blank"
                rel="noreferrer"
              >
                Quero Atendimento Presencial (Dupla)
              </a>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
