import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'

import './admin.css'

type StudentRow = {
  id: string
  nome: string
  email: string
  telefone: string
  notes: string | null
  status: 'pending' | 'active' | 'inactive'
  nextDueDate: string | null
  paymentReminderForDueDate: string | null
  createdAt: string
}

type ScheduleRow = {
  id: string
  studentId: string
  weekday: number
  startTime: string
  endTime: string
  notes: string | null
  studentNome: string
}

type SubmissionRow = {
  id: string
  payload: Record<string, unknown>
  studentId: string | null
  createdAt: string
}

const WEEKDAYS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
]

export function AdminDashboard() {
  const navigate = useNavigate()
  const [auth, setAuth] = useState<'loading' | 'in' | 'out'>('loading')
  const [tab, setTab] = useState<'students' | 'schedule' | 'fichas'>('students')
  const [students, setStudents] = useState<StudentRow[]>([])
  const [rules, setRules] = useState<ScheduleRow[]>([])
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const [newNome, setNewNome] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newTel, setNewTel] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [newStatus, setNewStatus] = useState<'pending' | 'active' | 'inactive'>(
    'active',
  )
  const [newDue, setNewDue] = useState('')

  const [schStudent, setSchStudent] = useState('')
  const [schWeekday, setSchWeekday] = useState(2)
  const [schStart, setSchStart] = useState('08:00')
  const [schEnd, setSchEnd] = useState('09:00')
  const [schNotes, setSchNotes] = useState('')

  const refreshStudents = useCallback(async () => {
    const r = await fetch('/api/students', { credentials: 'include' })
    const d = (await r.json()) as { students?: StudentRow[]; error?: string }
    if (!r.ok) throw new Error(d.error ?? 'Erro ao listar alunos.')
    setStudents(d.students ?? [])
  }, [])

  const refreshSchedule = useCallback(async () => {
    const r = await fetch('/api/schedule', { credentials: 'include' })
    const d = (await r.json()) as { rules?: ScheduleRow[]; error?: string }
    if (!r.ok) throw new Error(d.error ?? 'Erro ao listar agenda.')
    setRules(d.rules ?? [])
  }, [])

  const refreshSubmissions = useCallback(async () => {
    const r = await fetch('/api/anamnese-submissions', {
      credentials: 'include',
    })
    const d = (await r.json()) as {
      submissions?: SubmissionRow[]
      error?: string
    }
    if (!r.ok) throw new Error(d.error ?? 'Erro ao listar fichas.')
    setSubmissions(d.submissions ?? [])
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch('/api/admin/me', { credentials: 'include' })
        const d = (await r.json()) as { authenticated?: boolean }
        if (cancelled) return
        if (!d.authenticated) {
          setAuth('out')
          navigate('/admin/login', { replace: true })
          return
        }
        setAuth('in')
        await refreshStudents()
        await refreshSchedule()
        await refreshSubmissions()
      } catch {
        if (!cancelled) {
          setAuth('out')
          navigate('/admin/login', { replace: true })
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [navigate, refreshStudents, refreshSchedule, refreshSubmissions])

  async function logout() {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
    })
    navigate('/admin/login', { replace: true })
  }

  async function addStudent(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMsg(null)
    const r = await fetch('/api/students', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: newNome,
        email: newEmail,
        telefone: newTel,
        notes: newNotes || undefined,
        status: newStatus,
        nextDueDate: newDue || undefined,
      }),
    })
    const d = (await r.json()) as { error?: string }
    if (!r.ok) {
      setError(d.error ?? 'Erro ao criar aluno.')
      return
    }
    setMsg('Aluno criado.')
    setNewNome('')
    setNewEmail('')
    setNewTel('')
    setNewNotes('')
    setNewStatus('active')
    setNewDue('')
    await refreshStudents()
  }

  async function addRule(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMsg(null)
    const r = await fetch('/api/schedule', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: schStudent,
        weekday: schWeekday,
        startTime: schStart,
        endTime: schEnd,
        notes: schNotes || undefined,
      }),
    })
    const d = (await r.json()) as { error?: string }
    if (!r.ok) {
      setError(d.error ?? 'Erro ao criar horário.')
      return
    }
    setMsg('Horário adicionado.')
    setSchNotes('')
    await refreshSchedule()
  }

  async function deleteRule(id: string) {
    if (!confirm('Remover este horário?')) return
    setError(null)
    const r = await fetch(`/api/schedule/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    const d = (await r.json()) as { error?: string }
    if (!r.ok) {
      setError(d.error ?? 'Erro ao remover.')
      return
    }
    await refreshSchedule()
  }

  async function deleteStudent(id: string) {
    if (!confirm('Excluir este aluno? Horários vinculados serão removidos.'))
      return
    setError(null)
    const r = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    const d = (await r.json()) as { error?: string }
    if (!r.ok) {
      setError(d.error ?? 'Erro ao excluir.')
      return
    }
    await refreshStudents()
    await refreshSchedule()
  }

  async function promoteSubmission(submissionId: string) {
    setError(null)
    setMsg(null)
    const r = await fetch('/api/anamnese-submissions', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId }),
    })
    const d = (await r.json()) as { error?: string }
    if (!r.ok) {
      setError(d.error ?? 'Não foi possível cadastrar a partir da ficha.')
      return
    }
    setMsg('Aluno cadastrado a partir da ficha (pendente).')
    await refreshStudents()
    await refreshSubmissions()
  }

  if (auth === 'loading') {
    return (
      <div className="admin">
        <p className="admin-loading">Carregando…</p>
      </div>
    )
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <h1>Painel</h1>
        <div className="admin-actions">
          <Link to="/">← Site</Link>
          <button type="button" onClick={() => void logout()}>
            Sair
          </button>
        </div>
      </header>

      {error ? <p className="error">{error}</p> : null}
      {msg ? <p className="success">{msg}</p> : null}

      <div className="admin-tabs">
        <button
          type="button"
          className={tab === 'students' ? 'active' : ''}
          onClick={() => setTab('students')}
        >
          Alunos
        </button>
        <button
          type="button"
          className={tab === 'schedule' ? 'active' : ''}
          onClick={() => setTab('schedule')}
        >
          Agenda
        </button>
        <button
          type="button"
          className={tab === 'fichas' ? 'active' : ''}
          onClick={() => setTab('fichas')}
        >
          Fichas recebidas
        </button>
      </div>

      {tab === 'students' ? (
        <>
          <section className="admin-card">
            <h2>Novo aluno (manual)</h2>
            <form className="admin-form-grid" onSubmit={addStudent}>
              <label>
                Nome
                <input
                  value={newNome}
                  onChange={(e) => setNewNome(e.target.value)}
                  required
                />
              </label>
              <label>
                E-mail
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </label>
              <label>
                Telefone
                <input
                  value={newTel}
                  onChange={(e) => setNewTel(e.target.value)}
                  required
                />
              </label>
              <label>
                Status
                <select
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(e.target.value as typeof newStatus)
                  }
                >
                  <option value="active">Ativo</option>
                  <option value="pending">Pendente</option>
                  <option value="inactive">Inativo</option>
                </select>
              </label>
              <label>
                Próximo vencimento (opcional)
                <input
                  type="date"
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                />
              </label>
              <label>
                Observações
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </label>
              <button type="submit">Salvar aluno</button>
            </form>
          </section>

          <section className="admin-card">
            <h2>Lista de alunos</h2>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Status</th>
                    <th>Vencimento</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td>{s.nome}</td>
                      <td>{s.email}</td>
                      <td>{s.status}</td>
                      <td>{s.nextDueDate ?? '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => void deleteStudent(s.id)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length === 0 ? (
                <p className="muted">Nenhum aluno cadastrado.</p>
              ) : null}
            </div>
          </section>
        </>
      ) : null}

      {tab === 'schedule' ? (
        <>
          <section className="admin-card">
            <h2>Novo horário recorrente</h2>
            <form className="admin-form-grid" onSubmit={addRule}>
              <label>
                Aluno
                <select
                  value={schStudent}
                  onChange={(e) => setSchStudent(e.target.value)}
                  required
                >
                  <option value="">Selecione…</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Dia da semana
                <select
                  value={schWeekday}
                  onChange={(e) => setSchWeekday(Number(e.target.value))}
                >
                  {WEEKDAYS.map((w, i) => (
                    <option key={w} value={i}>
                      {w}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Início
                <input
                  type="time"
                  value={schStart}
                  onChange={(e) => setSchStart(e.target.value)}
                  required
                />
              </label>
              <label>
                Fim
                <input
                  type="time"
                  value={schEnd}
                  onChange={(e) => setSchEnd(e.target.value)}
                  required
                />
              </label>
              <label>
                Observações
                <textarea
                  value={schNotes}
                  onChange={(e) => setSchNotes(e.target.value)}
                />
              </label>
              <button type="submit">Adicionar horário</button>
            </form>
          </section>

          <section className="admin-card">
            <h2>Horários</h2>
            <table>
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Dia</th>
                  <th>Horário</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id}>
                    <td>{r.studentNome}</td>
                    <td>{WEEKDAYS[r.weekday] ?? r.weekday}</td>
                    <td>
                      {r.startTime} – {r.endTime}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => void deleteRule(r.id)}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rules.length === 0 ? (
              <p className="muted">Nenhum horário cadastrado.</p>
            ) : null}
          </section>
        </>
      ) : null}

      {tab === 'fichas' ? (
        <section className="admin-card">
          <h2>Fichas de anamnese (site)</h2>
          <p className="muted">
            Após o envio pelo site, a ficha aparece aqui. Use “Cadastrar aluno”
            para criar um registro pendente com nome, e-mail e telefone da
            ficha.
          </p>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Nome (ficha)</th>
                <th>E-mail</th>
                <th>Aluno vinculado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => {
                const p = s.payload as Record<string, unknown>
                const nome = String(p.nomeCompleto ?? '—')
                const em = String(p.email ?? '—')
                return (
                  <tr key={s.id}>
                    <td>
                      {new Date(s.createdAt).toLocaleString('pt-BR', {
                        timeZone: 'America/Sao_Paulo',
                      })}
                    </td>
                    <td>{nome}</td>
                    <td>{em}</td>
                    <td>{s.studentId ? 'Sim' : '—'}</td>
                    <td>
                      {!s.studentId ? (
                        <button
                          type="button"
                          onClick={() => void promoteSubmission(s.id)}
                        >
                          Cadastrar aluno
                        </button>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {submissions.length === 0 ? (
            <p className="muted">Nenhuma ficha gravada no banco ainda.</p>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
