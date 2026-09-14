import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SELECTOR = '.scroll-reveal'
const VISIBLE = 'is-visible'

export function ScrollReveal() {
  const { pathname } = useLocation()

  useEffect(() => {
    let cancelled = false
    let observer: IntersectionObserver | null = null

    const start = () => {
      if (cancelled) return
      const nodes = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR))
      if (nodes.length === 0) return

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        nodes.forEach((el) => el.classList.add(VISIBLE))
        return
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            entry.target.classList.add(VISIBLE)
            observer?.unobserve(entry.target)
          })
        },
        {
          threshold: 0.08,
          rootMargin: '0px 0px -18% 0px',
        },
      )

      nodes.forEach((el) => observer?.observe(el))
    }

    const frame = window.requestAnimationFrame(start)

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
      observer?.disconnect()
    }
  }, [pathname])

  return null
}
