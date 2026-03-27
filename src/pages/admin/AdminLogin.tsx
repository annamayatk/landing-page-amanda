import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './admin.css'

export function AdminLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      })
      const data = (await r.json()) as { error?: string }
      if (!r.ok) {
        setError(data.error ?? 'Falha no login.')
        return
      }
      navigate('/admin', { replace: true })
    } catch {
      setError(
        'Sem API local: pare o Vite só (`npm run dev`) e use `npm run dev:vercel`, depois abra a URL que o terminal mostrar (ex.: localhost:3000) em /admin/login. Ou deixe `vercel dev` na porta 3000 e rode `npm run dev` noutro terminal.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin">
      <div className="admin-card admin-login">
        <h1>Painel — login</h1>
        {error ? <p className="error">{error}</p> : null}
        <form className="admin-form-grid" onSubmit={onSubmit}>
          <label>
            Senha
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: '1rem' }}>
          <strong>Local:</strong> rode <code>npm run dev:vercel</code> (não só{' '}
          <code>npm run dev</code>) e use a URL que aparecer no terminal.
          Alternativa: um terminal com <code>vercel dev</code> na porta 3000 e
          outro com <code>npm run dev</code> — o Vite repassa <code>/api</code>{' '}
          para esse servidor.
        </p>
      </div>
    </div>
  )
}
