import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'

import { readApiJson } from '../../lib/apiUtils'
import './admin.css'

export function AdminLogin() {
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
      const data = await readApiJson<{ error?: string }>(r)
      if (!r.ok) {
        setError(data.error ?? 'Falha no login.')
        return
      }
      // Recarrega a página para garantir que o cookie HttpOnly seja enviado.
      window.location.assign('/admin')
    } catch {
      setError('Não foi possível conectar. Tente de novo em instantes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin">
      <div className="admin-card admin-login">
        <h1>Painel</h1>
        <p className="admin-login-lead">Acesso restrito.</p>
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
        <p className="admin-login-footer">
          <Link to="/">← Voltar ao site</Link>
        </p>
      </div>
    </div>
  )
}
