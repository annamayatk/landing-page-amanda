import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import amandaPhoto from '../assets/amanda.jpeg'
import amandaTreinoPhoto from '../assets/amanda-treino.jpg'
import amandaTreinoPuxadaPhoto from '../assets/amanda-treino-puxada.jpg'
import joaoVitorPhoto from '../assets/joao-vitor-torres.png'
import resultado1 from '../assets/resultado1.jpeg'
import resultado2 from '../assets/resultado2.jpeg'
import resultado3 from '../assets/resultado3.jpeg'
import resultado4 from '../assets/resultado4.png'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

export function Home() {
  const [planosModalOpen, setPlanosModalOpen] = useState(false)

  useEffect(() => {
    if (!planosModalOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPlanosModalOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [planosModalOpen])

  return (
    <div className="page">
      <Header />

      <main>
        <section className="hero" id="inicio">
          <div className="hero-cinematic">
            <div className="hero-cinematic-photo">
              <img
                src={amandaTreinoPuxadaPhoto}
                alt="Amanda Atkinson corrigindo a execução de uma puxada alta com aluna na academia"
              />
            </div>
            <div className="hero-content">
              <h1>
                Treino e nutrição pensados
                <span> para a sua rotina.</span>
              </h1>
              <p className="hero-subtitle">
                Cada aluno que chega até mim tem uma história diferente, e o
                treino precisa refletir isso. Por isso, nada aqui é padronizado:
                cada planejamento é construído do zero, pensando nos seus
                objetivos, na sua rotina e no seu corpo. Quem opta pelo plano
                Premium conta ainda com um trabalho integrado ao nutricionista
                João Vitor Torres, para que treino e alimentação caminhem na
                mesma direção.
              </p>

              <div className="hero-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setPlanosModalOpen(true)}
                >
                  Conhecer os planos
                </button>
                <a
                  href="https://wa.me/553284695345"
                  className="btn btn-ghost"
                  target="_blank"
                  rel="noreferrer"
                >
                  Tirar dúvidas no WhatsApp
                </a>
              </div>

              <div className="hero-highlights">
                <div>
                  <span className="highlight-number">100%</span>
                  <span className="highlight-label">Treino individualizado</span>
                </div>
                <div>
                  <span className="highlight-number">2</span>
                  <span className="highlight-label">Planos sob medida</span>
                </div>
                <div>
                  <span className="highlight-number">+ Constância</span>
                  <span className="highlight-label">+ Resultados reais</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-team-band">
            <div className="hero-team-intro">
              <div className="amanda-intro">
                <div className="amanda-intro-top">
                  <div className="amanda-photo-wrapper">
                    <img
                      src={amandaPhoto}
                      alt="Foto da personal trainer Amanda Atkinson"
                      className="amanda-photo"
                    />
                  </div>
                  <div className="amanda-intro-text">
                    <span className="amanda-intro-label">Quem vai te acompanhar</span>
                    <p className="amanda-intro-name">
                      Amanda Atkinson
                      <span>Personal Trainer</span>
                      <span className="intro-registry">CREF: 065517-G/RJ</span>
                    </p>
                  </div>
                </div>
                <div className="partner-intro">
                  <div className="partner-photo-wrapper">
                    <img
                      src={joaoVitorPhoto}
                      alt="João Vitor Torres, nutricionista parceiro"
                      className="partner-photo"
                    />
                  </div>
                  <div className="partner-intro-text">
                    <span className="partner-intro-label">Nutri parceiro</span>
                    <p className="partner-intro-name">
                      João Vitor Torres
                      <span>Nutricionista</span>
                      <span className="intro-registry">CRN4: 19100411</span>
                    </p>
                  </div>
                </div>
                <div className="hero-tags hero-tags--after-partner">
                  <Link to="/consultoria" className="hero-tag hero-tag-link">
                    Consultoria personalizada
                  </Link>
                  <Link
                    to="/atendimento-presencial"
                    className="hero-tag hero-tag-link"
                  >
                    Atendimento presencial
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-cards">
            <div className="hero-card">
              <div className="hero-badge">Vagas limitadas</div>
              <h2>Consultoria Personalizada</h2>
              <p>
                Escolha o plano que melhor se encaixa na sua rotina e comece a
                treinar com estratégia e segurança.
              </p>
              <ul>
                <li>Treinos montados pela Amanda, pensando em você.</li>
                <li>Ajustes periódicos conforme sua evolução.</li>
                <li>
                  No Plano Premium, dieta prescrita pelo nutricionista parceiro.
                </li>
              </ul>
              <Link to="/consultoria#planos" className="btn btn-primary btn-full">
                Ver planos e valores
              </Link>
            </div>

            <div className="hero-card">
              <div className="hero-badge">Atendimento presencial</div>
              <h2>Treino com orientação individual</h2>
              <p>
                Acompanhamento presencial com orientação individual durante toda
                a execução dos exercícios.
              </p>
              <ul>
                <li>Somente em ITAIPAVA (Petrópolis - RJ).</li>
                <li>Treino adaptado ao seu objetivo e evolução.</li>
              </ul>
              <Link
                to="/atendimento-presencial#planos-personal"
                className="btn btn-primary btn-full"
              >
                Ver planos e valores
              </Link>
            </div>
          </div>
        </section>

        <section className="section" id="resultados">
          <div className="section-header">
            <h2>O método funciona. E os resultados provam.</h2>
            <p>
              Não é mágica. É treino estruturado, acompanhamento individual e,
              no Plano Premium, nutrição alinhada ao objetivo.
            </p>
          </div>

          <div className="results-grid">
            <article className="result-card">
              <div className="result-labels">
                <span className="badge badge-before">antes</span>
                <span className="badge badge-after">depois</span>
              </div>
              <img
                src={resultado1}
                alt="Resultado de antes e depois de aluna da consultoria"
                className="result-image"
              />
              <p>
                Transformação focada em emagrecimento com manutenção de massa
                magra, através de treino bem estruturado e dieta ajustada.
              </p>
            </article>

            <article className="result-card">
              <div className="result-labels">
                <span className="badge badge-before">antes</span>
                <span className="badge badge-after">depois</span>
              </div>
              <img
                src={resultado2}
                alt="Resultado de antes e depois focado em ganho de força"
                className="result-image"
              />
              <p>
                Ganho de força e definição muscular, com progressão de cargas
                acompanhada de perto para evitar lesões.
              </p>
            </article>

            <article className="result-card">
              <div className="result-labels">
                <span className="badge badge-before">antes</span>
                <span className="badge badge-after">depois</span>
              </div>
              <img
                src={resultado3}
                alt="Resultado de antes e depois com mudança de hábitos e constância"
                className="result-image"
              />
              <p>
                Reorganização completa da rotina, construção de constância e
                mudança de hábitos para resultados duradouros.
              </p>
            </article>

            <article className="result-card">
              <div className="result-labels">
                <span className="badge badge-before">antes</span>
                <span className="badge badge-after">depois</span>
              </div>
              <img
                src={resultado4}
                alt="Resultado de antes e depois com evolução de composição corporal e definição"
                className="result-image"
              />
              <p>
                Evolução com treino consistente: mais definição, postura e
                confiança - do ambiente de casa para a rotina na academia.
              </p>
            </article>
          </div>
        </section>

        <section className="about-split" id="amanda" aria-labelledby="about-amanda-title">
          <div className="about-split-photo">
            <img
              src={amandaTreinoPhoto}
              alt="Amanda Atkinson corrigindo um desenvolvimento de ombros com aluna na academia"
            />
          </div>
          <div className="about-split-content">
            <h2 id="about-amanda-title">Quem é Amanda Atkinson?</h2>
            <p>
              Amanda é personal trainer (CREF 065517-G/RJ). Quando você entra na
              consultoria, o acompanhamento é 100% individual. O treino é pensado do
              zero para o seu objetivo, a sua rotina e o seu corpo.
            </p>
            <p>
              Enquanto muita consultoria online entrega uma planilha pronta e
              some, eu construo cada planejamento do zero, levando em conta
              seu histórico e fico ao seu lado ao longo de todo o processo. No
              Plano Premium, o trabalho é integrado ao nutricionista João Vitor
              Torres.
            </p>
            <p>
              A metodologia une treino estruturado com acompanhamento de perto.
              Sem radicalismo e planilha genérica, sem treino igual para todo
              mundo.
            </p>
            <p className="about-split-highlight">
              O resultado são alunas e alunos que finalmente evoluem, e mantém resultados duradouros.
            </p>
            <button
              type="button"
              className="btn btn-primary about-split-cta"
              onClick={() => setPlanosModalOpen(true)}
            >
              Quero evoluir de verdade
            </button>
          </div>
        </section>

        <section className="section section-cta" id="contato">
          <div className="cta-card">
            <h2>Pronta para começar?</h2>
            <p>
              Envie uma mensagem e vamos entender juntos qual plano faz mais
              sentido para o seu momento.
            </p>

            <div className="cta-actions">
              <a
                href="https://wa.me/553284695345?text=Quero%20come%C3%A7ar%20a%20consultoria"
                className="btn btn-primary btn-full"
                target="_blank"
                rel="noreferrer"
              >
                Falar com a Amanda no WhatsApp
              </a>
              <p className="cta-note">
                Acompanhe meus conteúdos no Instagram:{' '}
                <a
                  href="https://instagram.com/atkinson.personal"
                  target="_blank"
                  rel="noreferrer"
                >
                  @atkinson.personal
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>

      {planosModalOpen ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setPlanosModalOpen(false)}
        >
          <div
            className="modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="planos-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Fechar"
              onClick={() => setPlanosModalOpen(false)}
            >
              ×
            </button>
            <h2 id="planos-modal-title" className="modal-title">
              Treino presencial ou consultoria online?
            </h2>
            <p className="modal-subtitle">
              Escolha o tipo de acompanhamento para ver os valores.
            </p>
            <div className="modal-actions">
              <Link
                to="/consultoria#planos"
                className="btn btn-primary btn-full"
                onClick={() => setPlanosModalOpen(false)}
              >
                Consultoria online
              </Link>
              <Link
                to="/atendimento-presencial#planos-personal"
                className="btn btn-outline btn-full"
                onClick={() => setPlanosModalOpen(false)}
              >
                Treino presencial
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <Footer />
    </div>
  )
}
