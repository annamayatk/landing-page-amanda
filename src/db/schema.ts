import {
  date,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  smallint,
} from 'drizzle-orm/pg-core'

export const studentStatusEnum = pgEnum('student_status', [
  'pending',
  'active',
  'inactive',
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

/** Horários recorrentes: weekday 0 = domingo … 6 = sábado (Date.getUTCDay) */
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
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('schedule_rules_student_id_idx').on(t.studentId)],
)

export type Student = typeof students.$inferSelect
export type NewStudent = typeof students.$inferInsert
export type ScheduleRule = typeof scheduleRules.$inferSelect
export type NewScheduleRule = typeof scheduleRules.$inferInsert
