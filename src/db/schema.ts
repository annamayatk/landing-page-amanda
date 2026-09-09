import {
  date,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  smallint,
} from 'drizzle-orm/pg-core'

export const studentStatusEnum = pgEnum('student_status', [
  'pending',
  'active',
  'inactive',
])

export const scheduleExceptionTypeEnum = pgEnum('schedule_exception_type', [
  'cancelled',
  'rescheduled',
])

export const students = pgTable(
  'students',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    nome: text('nome').notNull(),
    email: text('email').notNull().unique(),
    telefone: text('telefone').notNull(),
    notes: text('notes'),
    status: studentStatusEnum('status').notNull().default('active'),
    /** Próximo vencimento de pagamento (null = sem lembrete automático) */
    nextDueDate: date('next_due_date', { mode: 'string' }),
    /** Quando o lembrete deste ciclo já foi enviado (igual a nextDueDate após envio) */
    paymentReminderForDueDate: date('payment_reminder_for_due_date', {
      mode: 'string',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('students_email_idx').on(t.email),
    index('students_next_due_date_idx').on(t.nextDueDate),
  ],
)

export const anamneseSubmissions = pgTable('anamnese_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  payload: jsonb('payload').notNull().$type<Record<string, unknown>>(),
  studentId: uuid('student_id').references(() => students.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

/** Horários recorrentes: weekday 0 = domingo … 6 = sábado (Date.getDay) */
export const scheduleRules = pgTable(
  'schedule_rules',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    weekday: smallint('weekday').notNull(), // 0–6
    startTime: text('start_time').notNull(), // "HH:MM"
    endTime: text('end_time').notNull(),
    notes: text('notes'),
    /** Primeira semana em que a regra vale (inclusive) */
    validFrom: date('valid_from', { mode: 'string' }).notNull(),
    /** Última semana em que a regra vale (inclusive); null = ainda ativa */
    validUntil: date('valid_until', { mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('schedule_rules_student_id_idx').on(t.studentId)],
)

/** Exceções pontuais: cancelamento ou remarque de uma aula específica */
export const scheduleExceptions = pgTable(
  'schedule_exceptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    ruleId: uuid('rule_id')
      .notNull()
      .references(() => scheduleRules.id, { onDelete: 'cascade' }),
    originalDate: date('original_date', { mode: 'string' }).notNull(),
    type: scheduleExceptionTypeEnum('type').notNull(),
    newDate: date('new_date', { mode: 'string' }),
    newStartTime: text('new_start_time'),
    newEndTime: text('new_end_time'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('schedule_exceptions_rule_date_idx').on(
      t.ruleId,
      t.originalDate,
    ),
  ],
)

/** Falta sem aviso (“bolo”) numa aula específica */
export const classNoShows = pgTable(
  'class_no_shows',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    ruleId: uuid('rule_id')
      .notNull()
      .references(() => scheduleRules.id, { onDelete: 'cascade' }),
    classDate: date('class_date', { mode: 'string' }).notNull(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('class_no_shows_rule_date_idx').on(t.ruleId, t.classDate),
    index('class_no_shows_student_id_idx').on(t.studentId),
  ],
)

export type Student = typeof students.$inferSelect
export type NewStudent = typeof students.$inferInsert
export type ScheduleRule = typeof scheduleRules.$inferSelect
export type NewScheduleRule = typeof scheduleRules.$inferInsert
export type ScheduleException = typeof scheduleExceptions.$inferSelect
export type NewScheduleException = typeof scheduleExceptions.$inferInsert
export type ClassNoShow = typeof classNoShows.$inferSelect
export type NewClassNoShow = typeof classNoShows.$inferInsert
