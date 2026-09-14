import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import logoAmanda from '../assets/logo-amanda.png'

const drawerLinks = [
  { to: '/', label: 'Início' },
  { to: '/consultoria', label: 'Consultoria' },
  { to: '/atendimento-presencial', label: 'Personal' },
  { to: '/#resultados', label: 'Resultados' },
  { to: '/#amanda', label: 'Amanda' },
  { to: '/#contato', label: 'Contato' },
] as const

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  const drawer = menuOpen
    ? createPortal(
        <>
          <div
            className="nav-drawer-backdrop"
            role="presentation"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="mobile-nav-drawer"
            className="nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
          >
            <div className="nav-drawer-header">
              <span className="nav-drawer-title">Menu</span>
              <button
                type="button"
                className="nav-drawer-close"
                aria-label="Fechar menu"
                onClick={() => setMenuOpen(false)}
              >
                ×
              </button>
            </div>
            <nav className="nav-drawer-nav" aria-label="Navegação principal">
              {drawerLinks.map(({ to, label }) => (
                <Link
                  key={to + label}
                  to={to}
                  className="nav-drawer-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <a
                href="https://wa.me/553284695345"
                className="nav-drawer-link nav-drawer-link--cta"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuOpen(false)}
              >
                WhatsApp
              </a>
            </nav>
          </div>
        </>,
        document.body,
      )
    : null

  return (
    <>
      <header className="header">
        <button
          type="button"
          className="header-menu-toggle"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          id="mobile-menu-button"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="header-menu-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        <Link to="/" className="logo-area logo-link header-logo">
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
        </Link>

        <nav className="nav" aria-label="Principal">
          <Link to="/consultoria">Consultoria</Link>
          <Link to="/atendimento-presencial">Personal</Link>
          <Link to="/#resultados">Resultados</Link>
          <Link to="/#amanda">Amanda</Link>
          <Link to="/#contato">Contato</Link>
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

      {drawer}
    </>
  )
}
