CREATE TYPE "public"."schedule_exception_type" AS ENUM('cancelled', 'rescheduled');--> statement-breakpoint
ALTER TABLE "schedule_rules" ADD COLUMN "valid_from" date DEFAULT CURRENT_DATE NOT NULL;--> statement-breakpoint
ALTER TABLE "schedule_rules" ADD COLUMN "valid_until" date;--> statement-breakpoint
UPDATE "schedule_rules" SET "valid_from" = ("created_at" AT TIME ZONE 'America/Sao_Paulo')::date WHERE "valid_from" IS NULL OR "valid_from" = CURRENT_DATE;--> statement-breakpoint
CREATE TABLE "schedule_exceptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_id" uuid NOT NULL,
	"original_date" date NOT NULL,
	"type" "schedule_exception_type" NOT NULL,
	"new_date" date,
	"new_start_time" text,
	"new_end_time" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "class_no_shows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_id" uuid NOT NULL,
	"class_date" date NOT NULL,
	"student_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "schedule_exceptions" ADD CONSTRAINT "schedule_exceptions_rule_id_schedule_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."schedule_rules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_no_shows" ADD CONSTRAINT "class_no_shows_rule_id_schedule_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."schedule_rules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_no_shows" ADD CONSTRAINT "class_no_shows_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "schedule_exceptions_rule_date_idx" ON "schedule_exceptions" USING btree ("rule_id","original_date");--> statement-breakpoint
CREATE UNIQUE INDEX "class_no_shows_rule_date_idx" ON "class_no_shows" USING btree ("rule_id","class_date");--> statement-breakpoint
CREATE INDEX "class_no_shows_student_id_idx" ON "class_no_shows" USING btree ("student_id");
