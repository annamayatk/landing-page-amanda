import logoAmanda from './assets/logo-amanda.png'
import amandaPhoto from './assets/amanda.jpeg'
import resultado1 from './assets/resultado1.jpeg'
import resultado2 from './assets/resultado2.jpeg'
import resultado3 from './assets/resultado3.jpeg'
import './App.css'

function App() {
  return (
    <div className="page">
      <header className="header">
        <div className="logo-area">
          <div className="logo-mark">
            <img
              src={logoAmanda}
              alt="Logo Amanda Atkinson"
              className="logo-img"
            />
          </div>
          <div className="logo-text">
            <span className="logo-name">Amanda Atkinson</span>
            <span className="logo-sub">Personal Trainer</span>
          </div>
        </div>
        <nav className="nav">
          <a href="#planos">Planos</a>
          <a href="#resultados">Resultados</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#contato">Contato</a>
        </nav>
        <a
          href="https://wa.me/553284695345"
          className="btn btn-outline header-cta"
          target="_blank"
          rel="noreferrer"
        >
          Falar no WhatsApp
        </a>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-content">
            <div className="amanda-intro">
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
                </p>
              </div>
            </div>
            <p className="hero-tag">Consultoria personalizada</p>
            <h1>
              Treino e nutrição pensados
              <span> para a sua rotina.</span>
            </h1>
            <p className="hero-subtitle">
              Esqueça treinos genéricos. Com a consultoria da Amanda, cada
              treino é planejado de forma 100% individualizada e, no plano
              Premium, alinhado à dieta prescrita pelo nutricionista parceiro
              João Vitor Torres.
            </p>

            <div className="hero-actions">
              <a href="#planos" className="btn btn-primary">
                Conhecer os planos
              </a>
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
            <a href="#planos" className="btn btn-primary btn-full">
              Ver planos e valores
            </a>
          </div>
        </section>

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
                  <span className="price-value">R$ 120</span>
                  <span className="price-detail">somente treino</span>
                </div>
                <div>
                  <span className="price-label">Trimestral</span>
                  <span className="price-value">R$ 330</span>
                  <span className="price-detail">R$ 110/mês</span>
                </div>
                <div>
                  <span className="price-label">Semestral</span>
                  <span className="price-value">R$ 600</span>
                  <span className="price-detail">R$ 100/mês</span>
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
                  <span className="price-value">R$ 250</span>
                  <span className="price-detail">treino + dieta</span>
                </div>
                <div>
                  <span className="price-label">Trimestral</span>
                  <span className="price-value">R$ 720</span>
                  <span className="price-detail">R$ 240/mês</span>
                </div>
                <div>
                  <span className="price-label">Semestral</span>
                  <span className="price-value">R$ 1.380</span>
                  <span className="price-detail">R$ 230/mês</span>
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

        <section className="section" id="resultados">
          <div className="section-header">
            <h2>O método funciona. E os resultados provam.</h2>
            <p>
              Não é mágica. É treino estruturado, acompanhamento individual e, no
              Plano Premium, nutrição alinhada ao objetivo.
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

      <footer className="footer">
        <p>
          Personal: <strong>Amanda Atkinson</strong> · Nutricionista parceiro:{' '}
          <strong>João Vitor Torres</strong>
        </p>
        <p className="footer-small">
          <span className="footer-ig-icon" aria-hidden="true" />
          {' '}
          <a
            href="https://instagram.com/atkinson.personal"
            target="_blank"
            rel="noreferrer"
          >
            @atkinson.personal
          </a>{' '}
          · Consultoria personalizada de treinamento e nutrição.
        </p>
      </footer>
    </div>
  )
}

export default App
