import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Rola para o topo ao trocar de rota; se houver #âncora, rola até o elemento. */
export function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const run = () => {
        const el = document.getElementById(id)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      requestAnimationFrame(() => {
        setTimeout(run, 0)
      })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return null
}
