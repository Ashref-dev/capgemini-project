CREATE TABLE "partner_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"file_type" varchar(100) NOT NULL,
	"file_size" bigint NOT NULL,
	"file_path" text NOT NULL,
	"description" text,
	"uploaded_by" varchar(200) NOT NULL,
	"uploaded_by_type" varchar(20) NOT NULL,
	"uploaded_by_id" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_meetings" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"meeting_date" timestamp with time zone NOT NULL,
	"duration_minutes" integer NOT NULL,
	"employee_name" varchar(200) NOT NULL,
	"employee_role" varchar(100),
	"employee_id" integer,
	"location" varchar(255),
	"meeting_type" varchar(50) NOT NULL,
	"agenda" text,
	"conclusions" text,
	"remarks" text,
	"agreements" text,
	"shared_documents" text,
	"satisfaction_score" integer,
	"next_steps" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"email_sent" boolean DEFAULT false,
	"email_subject" varchar(255),
	"is_read" boolean DEFAULT false,
	"sent_by" varchar(200),
	"sent_by_id" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "capgemini_employees" ADD COLUMN "phone" varchar(50);--> statement-breakpoint
ALTER TABLE "capgemini_employees" ADD COLUMN "department" varchar(100);--> statement-breakpoint
ALTER TABLE "capgemini_employees" ADD COLUMN "salary" integer;--> statement-breakpoint
ALTER TABLE "capgemini_employees" ADD COLUMN "hire_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "partner_documents" ADD CONSTRAINT "partner_documents_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_meetings" ADD CONSTRAINT "partner_meetings_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_notifications" ADD CONSTRAINT "partner_notifications_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_partner_documents_partner" ON "partner_documents" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "idx_partner_documents_type" ON "partner_documents" USING btree ("file_type");--> statement-breakpoint
CREATE INDEX "idx_partner_meetings_partner" ON "partner_meetings" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "idx_partner_meetings_date" ON "partner_meetings" USING btree ("meeting_date");--> statement-breakpoint
CREATE INDEX "idx_partner_notifications_partner" ON "partner_notifications" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "idx_partner_notifications_type" ON "partner_notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_partner_notifications_read" ON "partner_notifications" USING btree ("is_read");