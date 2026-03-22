import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import {
  ANAMNESE_SECTIONS,
  buildInitialAnamneseValues,
  validateRequiredAnamnese,
  type AnamneseField,
} from '../data/anamneseForm'

function getSubmitUrl(): string {
  const full = import.meta.env.VITE_ANAMNESE_API_URL?.trim()
  if (full) return full
  return '/api/anamnese'
}

/** Só dígitos, no máx. 8 (DDMMYYYY) → insere barras (ex.: 07051998 → 07/05/1998) */
function formatDateBRMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

/** Altura em metros (máx. 2,90 m): só dígitos, 1–3. */
function formatAlturaMetrosMask(raw: string): string {
  let digits = raw.replace(/\D/g, '').slice(0, 3)
  while (digits.length > 0 && digits[0] !== '1' && digits[0] !== '2') {
    digits = digits.slice(1)
  }
  if (digits.length === 0) return ''
  const a = digits[0]
  if (digits.length === 1) return a
  const bc = digits.slice(1)
  if (bc.length === 1) return `${a},${bc}`
  const heightCm = parseInt(a, 10) * 100 + parseInt(bc, 10)
  if (heightCm > 290) {
    return '2,90'
  }
  return `${a},${bc}`
}

/** Só dígitos; limite 10 (fixo) ou 11 (celular com 9 após DDD). Estado guarda sempre isto. */
function normalizeTelefoneDigits(raw: string): string {
  const d = raw.replace(/\D/g, '')
  if (d.length <= 2) return d
  const isMobile = d[2] === '9'
  return d.slice(0, isMobile ? 11 : 10)
}

/**
 * Exibição a partir de dígitos só (estado). Sem espaço após (XX) com só DDD — evita backspace preso.
 * (XX) XXXX-XXXX — 10 dígitos | (XX) XXXXX-XXXX — 11 dígitos
 */
function formatTelefoneDisplay(digitsOnly: string): string {
  const digits = digitsOnly.replace(/\D/g, '')
  if (digits.length === 0) return ''
  if (digits.length === 1) return `(${digits}`
  if (digits.length === 2) return `(${digits})`
  const isMobile = digits[2] === '9'
  const d = digits.slice(0, isMobile ? 11 : 10)
  const ddd = d.slice(0, 2)
  const local = d.slice(2)
  if (isMobile) {
    const loc = local.slice(0, 9)
    if (loc.length <= 5) return `(${ddd}) ${loc}`
    return `(${ddd}) ${loc.slice(0, 5)}-${loc.slice(5)}`
  }
  const loc = local.slice(0, 8)
  if (loc.length <= 4) return `(${ddd}) ${loc}`
  return `(${ddd}) ${loc.slice(0, 4)}-${loc.slice(4)}`
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

  if (field.mask === 'dateDDMMYYYY') {
    return (
      <input
        id={id}
        name={field.name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={10}
        placeholder={field.placeholder}
        className="anamnese-input"
        aria-required={field.required ?? false}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(formatDateBRMask(e.target.value))}
      />
    )
  }

  if (field.mask === 'alturaMetros') {
    return (
      <input
        id={id}
        name={field.name}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        maxLength={5}
        placeholder={field.placeholder}
        className="anamnese-input"
        aria-required={field.required ?? false}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(formatAlturaMetrosMask(e.target.value))}
      />
    )
  }

  if (field.mask === 'telefoneBR') {
    const digits = value.replace(/\D/g, '')
    return (
      <input
        id={id}
        name={field.name}
        type="text"
        inputMode="tel"
        autoComplete="tel"
        placeholder={field.placeholder}
        className="anamnese-input"
        aria-required={field.required ?? false}
        value={formatTelefoneDisplay(value)}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const next = normalizeTelefoneDigits(e.target.value)
          const prev = digits
          const extracted = e.target.value.replace(/\D/g, '')
          // Apagou só símbolo (mesmo n.º de dígitos) → remove um dígito para o backspace funcionar
          if (extracted.length === prev.length && e.target.value.length < formatTelefoneDisplay(prev).length) {
            onChange(prev.slice(0, -1))
            return
          }
          onChange(next)
        }}
      />
    )
  }

  return (
    <input
      {...common}
      type={field.name === 'email' ? 'email' : 'text'}
      inputMode={field.name === 'email' ? 'email' : undefined}
      placeholder={field.placeholder}
      autoComplete={field.name === 'email' ? 'email' : 'off'}
    />
  )
}

export function FichaInicial() {
  const [values, setValues] = useState(buildInitialAnamneseValues)
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    document.title = 'Consultoria Esportiva: Amanda Atkinson - Anamnese'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => {
      document.head.removeChild(meta)
      document.title = 'Consultoria Esportiva: Amanda Atkinson'
    }
  }, [])

  const setField = (name: string, v: string) => {
    setValues((prev) => ({ ...prev, [name]: v }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    const missing = validateRequiredAnamnese(values)
    if (missing) {
      setErrorMessage(missing)
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
