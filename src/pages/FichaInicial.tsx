import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import {
  ANAMNESE_SECTIONS,
  buildInitialAnamneseValues,
  type AnamneseField,
} from '../data/anamneseForm'

function getSubmitUrl(): string {
  const full = import.meta.env.VITE_ANAMNESE_API_URL?.trim()
  if (full) return full
  return '/api/anamnese'
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: AnamneseField
  value: string
  onChange: (v: string) => void
}) {
  const id = `anamnese-${field.name}`
  const common = {
    id,
    name: field.name,
    value,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(e.target.value),
    className: 'anamnese-input',
    'aria-required': field.required ?? false,
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        {...common}
        rows={4}
        placeholder={field.placeholder}
        autoComplete="off"
      />
    )
  }

  if (field.type === 'select' && field.options) {
    return (
      <select {...common} className="anamnese-input anamnese-select">
        {field.options.map((o) => (
          <option key={o.value || 'empty'} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    )
  }

  return (
    <input
      {...common}
      type="text"
      placeholder={field.placeholder}
      autoComplete={field.name === 'email' ? 'email' : field.name === 'telefone' ? 'tel' : 'off'}
    />
  )
}

export function FichaInicial() {
  const [values, setValues] = useState(buildInitialAnamneseValues)
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    document.title = 'Ficha inicial — Consultoria | Amanda Atkinson'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => {
      document.head.removeChild(meta)
      document.title = 'Consultoria Esportiva Amanda Atkinson'
    }
  }, [])

  const setField = (name: string, v: string) => {
    setValues((prev) => ({ ...prev, [name]: v }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!values.nomeCompleto?.trim() || !values.email?.trim()) {
      setErrorMessage('Preencha pelo menos nome completo e e-mail.')
      setStatus('error')
      return
    }

    setStatus('sending')
    try {
      const res = await fetch(getSubmitUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, _honeypot: honeypot }),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string }

      if (!res.ok) {
        setErrorMessage(json.error ?? 'Não foi possível enviar. Tente de novo mais tarde.')
        setStatus('error')
        return
      }

      setStatus('success')
      setValues(buildInitialAnamneseValues())
      setHoneypot('')
    } catch {
      setErrorMessage(
        'Não foi possível conectar ao servidor. Se estiver a testar no computador, use o deploy na Vercel ou `npx vercel dev`.',
      )
      setStatus('error')
    }
  }

  return (
    <div className="page">
      <Header />

      <main className="anamnese-main">
        <section className="section anamnese-section">
          <div className="section-header anamnese-header">
            <p className="anamnese-kicker">Consultoria de treinamento</p>
            <h1>Anamnese — ficha inicial</h1>
            <p className="anamnese-intro">
              Este formulário é enviado por link exclusivo. Preencha com calma; os dados vão direto para o e-mail da
              Amanda. Campos de saúde são importantes para montar seu treino com segurança.
            </p>
          </div>

          {status === 'success' ? (
            <div className="anamnese-feedback anamnese-feedback--ok" role="status">
              <h2>Obrigada!</h2>
              <p>Sua ficha foi enviada. A Amanda vai retornar pelo e-mail ou WhatsApp em breve.</p>
            </div>
          ) : (
            <form className="anamnese-form" onSubmit={handleSubmit} noValidate>
              <p className="anamnese-privacy-note">
                Ao enviar, você concorda que estes dados sejam usados apenas para elaboração do seu acompanhamento, nos
                termos da nossa relação de consultoria.
              </p>

              {ANAMNESE_SECTIONS.map((section) => (
                <fieldset key={section.title} className="anamnese-fieldset">
                  <legend className="anamnese-legend">{section.title}</legend>
                  <div className="anamnese-fields">
                    {section.fields.map((field) => (
                      <div key={field.name} className="anamnese-field">
                        <label className="anamnese-label" htmlFor={`anamnese-${field.name}`}>
                          {field.label}
                          {field.required ? <span className="anamnese-req"> *</span> : null}
                        </label>
                        <FieldInput field={field} value={values[field.name] ?? ''} onChange={(v) => setField(field.name, v)} />
                      </div>
                    ))}
                  </div>
                </fieldset>
              ))}

              <div className="anamnese-honeypot" aria-hidden="true">
                <label htmlFor="anamnese-website">Website</label>
                <input
                  id="anamnese-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {status === 'error' && errorMessage ? (
                <p className="anamnese-feedback anamnese-feedback--err" role="alert">
                  {errorMessage}
                </p>
              ) : null}

              <div className="anamnese-actions">
                <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                  {status === 'sending' ? 'A enviar…' : 'Enviar ficha'}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
