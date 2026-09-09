import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  type ClassNoShowRow,
  type ScheduleExceptionRow,
  type ScheduleRuleRow,
  WEEKDAYS,
  computeBoloStats,
  formatRuleSummary,
  todayYmd,
} from '../../lib/scheduleUtils'
import { ScheduleCalendar } from './ScheduleCalendar'
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

type SubmissionRow = {
  id: string
  payload: Record<string, unknown>
  studentId: string | null
  createdAt: string
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const [auth, setAuth] = useState<'loading' | 'in' | 'out'>('loading')
  const [tab, setTab] = useState<
    'students' | 'schedule' | 'fichas' | 'bolos'
  >('students')
  const [students, setStudents] = useState<StudentRow[]>([])
  const [rules, setRules] = useState<ScheduleRuleRow[]>([])
  const [exceptions, setExceptions] = useState<ScheduleExceptionRow[]>([])
  const [noShows, setNoShows] = useState<ClassNoShowRow[]>([])
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
  const [schValidFrom, setSchValidFrom] = useState(todayYmd())

  const refreshStudents = useCallback(async () => {
    const r = await fetch('/api/students', { credentials: 'include' })
    const d = (await r.json()) as { students?: StudentRow[]; error?: string }
    if (!r.ok) throw new Error(d.error ?? 'Erro ao listar alunos.')
    setStudents(d.students ?? [])
  }, [])

  const refreshSchedule = useCallback(async () => {
    const r = await fetch('/api/schedule', { credentials: 'include' })
    const d = (await r.json()) as {
      rules?: ScheduleRuleRow[]
      exceptions?: ScheduleExceptionRow[]
      noShows?: ClassNoShowRow[]
      error?: string
    }
    if (!r.ok) throw new Error(d.error ?? 'Erro ao listar agenda.')
    setRules(d.rules ?? [])
    setExceptions(d.exceptions ?? [])
    setNoShows(d.noShows ?? [])
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
  }, [navigate])

  useEffect(() => {
    if (auth !== 'in') return
    let cancelled = false
    ;(async () => {
      setError(null)
      try {
        await refreshStudents()
        await refreshSchedule()
        await refreshSubmissions()
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : 'Erro ao carregar dados do painel.',
          )
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [auth, refreshStudents, refreshSchedule, refreshSubmissions])

  const boloStats = useMemo(() => {
    const statusMap = new Map(
      students.map((s) => [s.id, { status: s.status }]),
    )
    return computeBoloStats(rules, exceptions, noShows, statusMap, 3)
  }, [rules, exceptions, noShows, students])

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
        validFrom: schValidFrom,
      }),
    })
    const d = (await r.json()) as { error?: string }
    if (!r.ok) {
      setError(d.error ?? 'Erro ao criar horário.')
      return
    }
    setMsg('Horário oficial adicionado.')
    setSchNotes('')
    await refreshSchedule()
  }

  async function endRule(id: string) {
    const until = prompt(
      'Encerrar horário a partir de qual data? (AAAA-MM-DD)',
      todayYmd(),
    )
    if (!until) return
    setError(null)
    const r = await fetch(`/api/schedule/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ validUntil: until }),
    })
    const d = (await r.json()) as { error?: string }
    if (!r.ok) {
      setError(d.error ?? 'Erro ao encerrar horário.')
      return
    }
    setMsg('Horário encerrado — semanas anteriores continuam no calendário.')
    await refreshSchedule()
  }

  async function inactivateStudent(id: string) {
    if (
      !confirm(
        'Inativar aluno? Horários oficiais serão encerrados hoje (histórico permanece).',
      )
    )
      return
    setError(null)
    const r = await fetch(`/api/students/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'inactive' }),
    })
    const d = (await r.json()) as { error?: string }
    if (!r.ok) {
      setError(d.error ?? 'Erro ao inativar.')
      return
    }
    setMsg('Aluno inativado.')
    await refreshStudents()
    await refreshSchedule()
  }

  async function deleteStudent(id: string) {
    if (!confirm('Excluir este aluno permanentemente?')) return
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
          className={tab === 'bolos' ? 'active' : ''}
          onClick={() => setTab('bolos')}
        >
          Bolos 🎂
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
                        {s.status !== 'inactive' ? (
                          <button
                            type="button"
                            onClick={() => void inactivateStudent(s.id)}
                          >
                            Inativar
                          </button>
                        ) : null}{' '}
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
            <h2>Calendário semanal</h2>
            <p className="muted">
              Clique numa aula para desmarcar, remarcar ou marcar bolo 🎂.
              Navegue entre semanas para ver histórico.
            </p>
            <ScheduleCalendar
              rules={rules}
              exceptions={exceptions}
              noShows={noShows}
              onRefresh={refreshSchedule}
              onError={setError}
              onMsg={setMsg}
            />
          </section>

          <section className="admin-card">
            <h2>Novo horário oficial (recorrente)</h2>
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
                Válido a partir de
                <input
                  type="date"
                  value={schValidFrom}
                  onChange={(e) => setSchValidFrom(e.target.value)}
                  required
                />
              </label>
              <label>
                Observações (horário oficial)
                <textarea
                  value={schNotes}
                  onChange={(e) => setSchNotes(e.target.value)}
                />
              </label>
              <button type="submit">Adicionar horário</button>
            </form>
          </section>

          <section className="admin-card">
            <h2>Horários oficiais</h2>
            <table>
              <thead>
                <tr>
                  <th>Resumo</th>
                  <th>Válido de</th>
                  <th>Até</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id}>
                    <td>{formatRuleSummary(r)}</td>
                    <td>{r.validFrom}</td>
                    <td>{r.validUntil ?? '—'}</td>
                    <td>
                      {!r.validUntil ? (
                        <button
                          type="button"
                          onClick={() => void endRule(r.id)}
                        >
                          Encerrar
                        </button>
                      ) : null}
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

      {tab === 'bolos' ? (
        <section className="admin-card">
          <h2>Percentual de bolos 🎂</h2>
          <p className="muted">
            Falta sem aviso nas aulas já passadas (últimos 3 meses). Quem
            desmarcou com antecedência não entra na conta.
          </p>
          <table>
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Status</th>
                <th>Aulas</th>
                <th>Bolos 🎂</th>
                <th>% bolo</th>
              </tr>
            </thead>
            <tbody>
              {boloStats.map((b) => (
                <tr key={b.studentId}>
                  <td>{b.studentNome}</td>
                  <td>{b.status}</td>
                  <td>{b.totalClasses}</td>
                  <td>{b.bolos}</td>
                  <td>
                    {b.totalClasses === 0 ? (
                      '—'
                    ) : (
                      <span
                        className={
                          b.boloPct >= 20 ? 'bolo-pct-high' : undefined
                        }
                      >
                        {b.boloPct}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {boloStats.length === 0 ? (
            <p className="muted">Sem dados ainda — cadastre horários e aulas.</p>
          ) : null}
        </section>
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
