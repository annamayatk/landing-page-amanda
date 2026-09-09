export type ScheduleRuleRow = {
  id: string
  studentId: string
  weekday: number
  startTime: string
  endTime: string
  notes: string | null
  validFrom: string
  validUntil: string | null
  studentNome: string
}

export type ScheduleExceptionRow = {
  id: string
  ruleId: string
  originalDate: string
  type: 'cancelled' | 'rescheduled'
  newDate: string | null
  newStartTime: string | null
  newEndTime: string | null
  notes: string | null
}

export type ClassNoShowRow = {
  id: string
  ruleId: string
  classDate: string
  studentId: string
}

export type CalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  ruleId: string
  studentId: string
  studentNome: string
  /** Data em que o evento aparece no calendário */
  classDate: string
  /** Data da aula oficial (para bolo / exceções) */
  officialClassDate: string
  isRescheduled: boolean
  isNoShow: boolean
  officialLabel: string
  exceptionNotes: string | null
}

export type BoloStatRow = {
  studentId: string
  studentNome: string
  status: string
  totalClasses: number
  bolos: number
  boloPct: number
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

export function todayYmd(): string {
  return formatYmd(new Date())
}

export function formatYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

/** Segunda-feira da semana que contém `d` (semana ISO-like, segunda = início) */
export function startOfWeekMonday(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  return x
}

export function endOfWeekSunday(weekStartMonday: Date): Date {
  return addDays(weekStartMonday, 6)
}

function isDateInRange(
  ymd: string,
  from: string,
  until: string | null,
): boolean {
  if (ymd < from) return false
  if (until != null && ymd > until) return false
  return true
}

function dateForWeekday(weekStartMonday: Date, weekday: number): string {
  const sundayOffset = weekday === 0 ? 6 : weekday - 1
  return formatYmd(addDays(weekStartMonday, sundayOffset))
}

function parseTimeOnDate(ymd: string, time: string): Date {
  const [h, m] = time.split(':').map(Number)
  const d = parseYmd(ymd)
  d.setHours(h, m, 0, 0)
  return d
}

export function officialScheduleLabel(rule: ScheduleRuleRow): string {
  const wd = WEEKDAYS[rule.weekday] ?? String(rule.weekday)
  return `${wd} ${rule.startTime}–${rule.endTime}`
}

function exceptionMap(exceptions: ScheduleExceptionRow[]) {
  const byOriginal = new Map<string, ScheduleExceptionRow>()
  for (const ex of exceptions) {
    byOriginal.set(`${ex.ruleId}:${ex.originalDate}`, ex)
  }
  return byOriginal
}

function noShowSet(noShows: ClassNoShowRow[]) {
  return new Set(noShows.map((n) => `${n.ruleId}:${n.classDate}`))
}

function buildEvent(
  rule: ScheduleRuleRow,
  classDate: string,
  startTime: string,
  endTime: string,
  opts: {
    officialClassDate: string
    isRescheduled: boolean
    isNoShow: boolean
    exceptionNotes: string | null
  },
): CalendarEvent {
  const start = parseTimeOnDate(classDate, startTime)
  const end = parseTimeOnDate(classDate, endTime)
  const suffix = opts.isRescheduled ? ' *' : opts.isNoShow ? ' 🎂' : ''
  return {
    id: `${rule.id}:${classDate}${opts.isRescheduled ? ':r' : ''}`,
    title: `${rule.studentNome}${suffix}`,
    start: start.toISOString(),
    end: end.toISOString(),
    ruleId: rule.id,
    studentId: rule.studentId,
    studentNome: rule.studentNome,
    classDate,
    officialClassDate: opts.officialClassDate,
    isRescheduled: opts.isRescheduled,
    isNoShow: opts.isNoShow,
    officialLabel: officialScheduleLabel(rule),
    exceptionNotes: opts.exceptionNotes,
  }
}

export function buildWeekEvents(
  rules: ScheduleRuleRow[],
  exceptions: ScheduleExceptionRow[],
  noShows: ClassNoShowRow[],
  weekStartMonday: Date,
): CalendarEvent[] {
  const exMap = exceptionMap(exceptions)
  const bolo = noShowSet(noShows)
  const events: CalendarEvent[] = []
  const added = new Set<string>()
  const weekStartYmd = formatYmd(weekStartMonday)
  const weekEndYmd = formatYmd(endOfWeekSunday(weekStartMonday))

  for (const rule of rules) {
    const originalDate = dateForWeekday(weekStartMonday, rule.weekday)
    if (!isDateInRange(originalDate, rule.validFrom, rule.validUntil)) continue

    const ex = exMap.get(`${rule.id}:${originalDate}`)

    if (ex?.type === 'cancelled') continue

    if (
      ex?.type === 'rescheduled' &&
      ex.newDate &&
      ex.newStartTime &&
      ex.newEndTime
    ) {
      if (
        ex.newDate >= weekStartYmd &&
        ex.newDate <= weekEndYmd &&
        isDateInRange(ex.newDate, rule.validFrom, rule.validUntil)
      ) {
        const id = `${rule.id}:${ex.newDate}:r`
        if (!added.has(id)) {
          events.push(
            buildEvent(rule, ex.newDate, ex.newStartTime, ex.newEndTime, {
              officialClassDate: originalDate,
              isRescheduled: true,
              isNoShow: bolo.has(`${rule.id}:${originalDate}`),
              exceptionNotes: ex.notes,
            }),
          )
          added.add(id)
        }
      }
      continue
    }

    const id = `${rule.id}:${originalDate}`
    if (!added.has(id)) {
      events.push(
        buildEvent(rule, originalDate, rule.startTime, rule.endTime, {
          officialClassDate: originalDate,
          isRescheduled: false,
          isNoShow: bolo.has(`${rule.id}:${originalDate}`),
          exceptionNotes: null,
        }),
      )
      added.add(id)
    }
  }

  for (const ex of exceptions) {
    if (
      ex.type !== 'rescheduled' ||
      !ex.newDate ||
      !ex.newStartTime ||
      !ex.newEndTime
    )
      continue
    if (ex.newDate < weekStartYmd || ex.newDate > weekEndYmd) continue

    const rule = rules.find((r) => r.id === ex.ruleId)
    if (!rule) continue
    if (!isDateInRange(ex.newDate, rule.validFrom, rule.validUntil)) continue

    const id = `${rule.id}:${ex.newDate}:r`
    if (added.has(id)) continue

    events.push(
      buildEvent(rule, ex.newDate, ex.newStartTime, ex.newEndTime, {
        officialClassDate: ex.originalDate,
        isRescheduled: true,
        isNoShow: bolo.has(`${rule.id}:${ex.originalDate}`),
        exceptionNotes: ex.notes,
      }),
    )
    added.add(id)
  }

  return events.sort((a, b) => a.start.localeCompare(b.start))
}

function eachWeekStartBetween(from: Date, to: Date): Date[] {
  const starts: Date[] = []
  let cur = startOfWeekMonday(from)
  const end = startOfWeekMonday(to)
  while (cur <= end) {
    starts.push(new Date(cur))
    cur = addDays(cur, 7)
  }
  return starts
}

/** Aulas passadas (exclui canceladas) nos últimos `months` meses */
export function computeBoloStats(
  rules: ScheduleRuleRow[],
  exceptions: ScheduleExceptionRow[],
  noShows: ClassNoShowRow[],
  studentStatus: Map<string, { status: string }>,
  months = 3,
): BoloStatRow[] {
  const today = todayYmd()
  const from = addDays(new Date(), -months * 30)
  const exMap = exceptionMap(exceptions)
  const bolo = noShowSet(noShows)

  const byStudent = new Map<
    string,
    { nome: string; status: string; classes: number; bolos: number }
  >()

  for (const rule of rules) {
    if (!byStudent.has(rule.studentId)) {
      byStudent.set(rule.studentId, {
        nome: rule.studentNome,
        status: studentStatus.get(rule.studentId)?.status ?? 'active',
        classes: 0,
        bolos: 0,
      })
    }

    for (const weekStart of eachWeekStartBetween(from, new Date())) {
      const classDate = dateForWeekday(weekStart, rule.weekday)
      if (classDate > today) continue
      if (!isDateInRange(classDate, rule.validFrom, rule.validUntil)) continue

      const ex = exMap.get(`${rule.id}:${classDate}`)
      if (ex?.type === 'cancelled') continue

      const effectiveDate =
        ex?.type === 'rescheduled' && ex.newDate ? ex.newDate : classDate
      if (effectiveDate > today) continue
      if (!isDateInRange(effectiveDate, rule.validFrom, rule.validUntil)) continue

      const row = byStudent.get(rule.studentId)!
      row.classes += 1
      if (bolo.has(`${rule.id}:${classDate}`)) row.bolos += 1
    }
  }

  return [...byStudent.entries()]
    .map(([studentId, s]) => ({
      studentId,
      studentNome: s.nome,
      status: s.status,
      totalClasses: s.classes,
      bolos: s.bolos,
      boloPct: s.classes > 0 ? Math.round((s.bolos / s.classes) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.boloPct - a.boloPct || b.bolos - a.bolos)
}

export function formatRuleSummary(rule: ScheduleRuleRow): string {
  const wd = WEEKDAYS[rule.weekday] ?? String(rule.weekday)
  const until = rule.validUntil
    ? ` (até ${parseYmd(rule.validUntil).toLocaleDateString('pt-BR')})`
    : ''
  return `${rule.studentNome} — ${wd} ${rule.startTime}–${rule.endTime}${until}`
}

export { WEEKDAYS }
