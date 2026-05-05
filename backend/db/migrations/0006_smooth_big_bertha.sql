CREATE TABLE "document_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_kind" varchar(20) NOT NULL,
	"document_id" integer NOT NULL,
	"chunk_index" integer NOT NULL,
	"chunk_text" text NOT NULL,
	"embedding" vector(1024) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"partner_id" integer,
	"owner_employee_id" integer,
	"status" varchar(40) DEFAULT 'active' NOT NULL,
	"health" varchar(1) DEFAULT 'G' NOT NULL,
	"priority" varchar(10) DEFAULT 'medium' NOT NULL,
	"start_date" date,
	"end_date" date,
	"budget" bigint,
	"currency" varchar(3) DEFAULT 'TND',
	"percent_complete" integer DEFAULT 0 NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" varchar(200) NOT NULL,
	"due_date" date,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"blockers" text,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"milestone_id" integer,
	"name" varchar(200) NOT NULL,
	"assignee_employee_id" integer,
	"due_date" date,
	"status" varchar(20) DEFAULT 'todo' NOT NULL,
	"blocker_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_allocations" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"employee_id" integer NOT NULL,
	"role" varchar(80),
	"fte_percent" integer DEFAULT 100 NOT NULL,
	"start_date" date,
	"end_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
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
ALTER TABLE "chat_messages" ADD COLUMN "message_id" text;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_employee_id_capgemini_employees_id_fk" FOREIGN KEY ("owner_employee_id") REFERENCES "public"."capgemini_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_assignee_employee_id_capgemini_employees_id_fk" FOREIGN KEY ("assignee_employee_id") REFERENCES "public"."capgemini_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_allocations" ADD CONSTRAINT "project_allocations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_allocations" ADD CONSTRAINT "project_allocations_employee_id_capgemini_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."capgemini_employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_embeddings_source_doc_idx" ON "document_embeddings" USING btree ("source_kind","document_id");--> statement-breakpoint
CREATE INDEX "project_allocations_project_employee_idx" ON "project_allocations" USING btree ("project_id","employee_id");--> statement-breakpoint
CREATE INDEX "idx_project_documents_project" ON "project_documents" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_documents_type" ON "project_documents" USING btree ("file_type");