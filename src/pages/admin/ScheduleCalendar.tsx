import { useCallback, useMemo, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg } from '@fullcalendar/core'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'

import { readApiJson } from '../../lib/apiUtils'
import {
  type CalendarEvent,
  type ClassNoShowRow,
  type ScheduleExceptionRow,
  type ScheduleRuleRow,
  buildWeekEvents,
  endOfWeekSunday,
  formatYmd,
  parseYmd,
  startOfWeekMonday,
} from '../../lib/scheduleUtils'

type Props = {
  rules: ScheduleRuleRow[]
  exceptions: ScheduleExceptionRow[]
  noShows: ClassNoShowRow[]
  onRefresh: () => Promise<void>
  onError: (msg: string) => void
  onMsg: (msg: string) => void
}

type SelectedEvent = CalendarEvent

export function ScheduleCalendar({
  rules,
  exceptions,
  noShows,
  onRefresh,
  onError,
  onMsg,
}: Props) {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeekMonday(new Date()),
  )
  const [selected, setSelected] = useState<SelectedEvent | null>(null)
  const [reschedDate, setReschedDate] = useState('')
  const [reschedStart, setReschedStart] = useState('08:00')
  const [reschedEnd, setReschedEnd] = useState('09:00')
  const [reschedNotes, setReschedNotes] = useState('')

  const events = useMemo(
    () => buildWeekEvents(rules, exceptions, noShows, weekStart),
    [rules, exceptions, noShows, weekStart],
  )

  const weekLabel = useMemo(() => {
    const end = endOfWeekSunday(weekStart)
    const fmt = (d: Date) =>
      d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    return `${fmt(weekStart)} – ${fmt(end)} ${end.getFullYear()}`
  }, [weekStart])

  const goPrev = () =>
    setWeekStart((w) => {
      const n = new Date(w)
      n.setDate(n.getDate() - 7)
      return n
    })

  const goNext = () =>
    setWeekStart((w) => {
      const n = new Date(w)
      n.setDate(n.getDate() + 7)
      return n
    })

  const goToday = () => setWeekStart(startOfWeekMonday(new Date()))

  const handleEventClick = useCallback((info: EventClickArg) => {
    const ev = info.event.extendedProps as CalendarEvent
    setSelected(ev)
    setReschedDate(ev.classDate)
    setReschedStart(
      info.event.start?.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }) ?? '08:00',
    )
    setReschedEnd(
      info.event.end?.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }) ?? '09:00',
    )
    setReschedNotes(
      ev.isRescheduled
        ? (ev.exceptionNotes ?? `* Horário oficial: ${ev.officialLabel}`)
        : `* Horário oficial: ${ev.officialLabel}`,
    )
  }, [])

  async function postException(body: Record<string, unknown>) {
    const r = await fetch('/api/schedule/exceptions', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const d = await readApiJson<{ error?: string }>(r)
    if (!r.ok) {
      onError(d.error ?? 'Erro ao salvar exceção.')
      return false
    }
    await onRefresh()
    return true
  }

  async function cancelClass() {
    if (!selected) return
    const ok = await postException({
      ruleId: selected.ruleId,
      originalDate: selected.officialClassDate,
      type: 'cancelled',
    })
    if (ok) {
      onMsg('Aula desmarcada nesta semana.')
      setSelected(null)
    }
  }

  async function rescheduleClass() {
    if (!selected) return
    const ok = await postException({
      ruleId: selected.ruleId,
      originalDate: selected.officialClassDate,
      type: 'rescheduled',
      newDate: reschedDate,
      newStartTime: reschedStart,
      newEndTime: reschedEnd,
      notes: reschedNotes || undefined,
    })
    if (ok) {
      onMsg('Aula remarcada.')
      setSelected(null)
    }
  }

  async function toggleBolo() {
    if (!selected) return
    const r = await fetch('/api/schedule/no-shows', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ruleId: selected.ruleId,
        classDate: selected.officialClassDate,
      }),
    })
    const d = await readApiJson<{ error?: string; toggled?: boolean }>(r)
    if (!r.ok) {
      onError(d.error ?? 'Erro ao marcar bolo.')
      return
    }
    onMsg(d.toggled ? 'Bolo registrado 🎂' : 'Bolo removido.')
    setSelected(null)
    await onRefresh()
  }

  return (
    <div className="schedule-calendar-wrap">
      <div className="schedule-calendar-toolbar">
        <button type="button" onClick={goPrev}>
          ← Semana anterior
        </button>
        <strong>{weekLabel}</strong>
        <button type="button" onClick={goNext}>
          Próxima semana →
        </button>
        <button type="button" onClick={goToday}>
          Hoje
        </button>
      </div>

      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale={ptBrLocale}
        firstDay={1}
        headerToolbar={false}
        allDaySlot={false}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        height="auto"
        nowIndicator
        editable={false}
        selectable={false}
        events={events.map((e) => ({
          id: e.id,
          title: e.title,
          start: e.start,
          end: e.end,
          extendedProps: e,
          classNames: [
            e.isNoShow ? 'fc-event-bolo' : '',
            e.isRescheduled ? 'fc-event-rescheduled' : '',
          ].filter(Boolean),
        }))}
        initialDate={formatYmd(weekStart)}
        key={formatYmd(weekStart)}
        eventClick={handleEventClick}
      />

      {selected ? (
        <div
          className="schedule-modal-backdrop"
          role="presentation"
          onClick={() => setSelected(null)}
        >
          <div
            className="schedule-modal admin-card"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{selected.studentNome}</h2>
            <p className="muted">
              {parseYmd(selected.classDate).toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
              })}{' '}
              ·{' '}
              {parseYmd(selected.classDate).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p>
              <strong>Horário oficial:</strong> {selected.officialLabel}
            </p>
            {selected.isRescheduled ? (
              <p className="muted">Remarque pontual nesta semana.</p>
            ) : null}
            {selected.isNoShow ? (
              <p className="schedule-bolo-badge">Deu bolo 🎂</p>
            ) : null}

            <div className="schedule-modal-actions">
              <button type="button" onClick={() => void toggleBolo()}>
                {selected.isNoShow ? 'Tirar bolo 🎂' : 'Deu bolo 🎂'}
              </button>
              <button type="button" onClick={() => void cancelClass()}>
                Desmarcar esta semana
              </button>
            </div>

            <hr className="schedule-modal-divider" />

            <h3>Remarcar pontualmente</h3>
            <div className="admin-form-grid">
              <label>
                Nova data
                <input
                  type="date"
                  value={reschedDate}
                  onChange={(e) => setReschedDate(e.target.value)}
                />
              </label>
              <label>
                Início
                <input
                  type="time"
                  value={reschedStart}
                  onChange={(e) => setReschedStart(e.target.value)}
                />
              </label>
              <label>
                Fim
                <input
                  type="time"
                  value={reschedEnd}
                  onChange={(e) => setReschedEnd(e.target.value)}
                />
              </label>
              <label>
                Observação
                <textarea
                  value={reschedNotes}
                  onChange={(e) => setReschedNotes(e.target.value)}
                  placeholder={`* Horário oficial: ${selected.officialLabel}`}
                />
              </label>
              <button type="button" onClick={() => void rescheduleClass()}>
                Salvar remarque
              </button>
            </div>

            <button
              type="button"
              className="schedule-modal-close"
              onClick={() => setSelected(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
