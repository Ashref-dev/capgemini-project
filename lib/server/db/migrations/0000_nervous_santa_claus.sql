CREATE TABLE "verification_tokens" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"token" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "capgemini_employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(100) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"role" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "capgemini_employees_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "client_partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"client_type" varchar(50),
	"industry" varchar(100),
	"annual_revenue" bigint,
	"num_active_projects" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "marketing_partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"marketing_type" varchar(100),
	"leads_generated_per_year" integer,
	"conversion_rate" numeric,
	"annual_marketing_budget" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"discount_type" varchar(50) NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"start_date" date,
	"end_date" date,
	"terms_conditions" text,
	"is_active" boolean DEFAULT true,
	"usage_count" integer DEFAULT 0,
	"total_value_tnd" numeric(12, 2) DEFAULT '0',
	"target_audience" varchar(100),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"email" varchar(100),
	"phone" varchar(20),
	"role" varchar(100),
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"event_name" varchar(255) NOT NULL,
	"event_type" varchar(100),
	"event_date" date NOT NULL,
	"event_location" varchar(255),
	"num_participants" integer,
	"num_capgemini_attendees" integer,
	"num_leads_generated" integer,
	"num_conversions" integer,
	"event_budget" integer,
	"satisfaction_score" integer,
	"event_status" varchar(50) DEFAULT 'planifie',
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_kpis" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"year" integer NOT NULL,
	"quarter" integer,
	"month" integer,
	"total_interactions" integer DEFAULT 0,
	"total_events" integer DEFAULT 0,
	"total_budget_spent" integer DEFAULT 0,
	"total_interns" integer DEFAULT 0,
	"total_apprentices" integer DEFAULT 0,
	"total_hires" integer DEFAULT 0,
	"conversion_rate" numeric(5, 2),
	"total_revenue_generated" numeric(18, 2) DEFAULT '0',
	"total_projects" integer DEFAULT 0,
	"total_licenses_sold" integer DEFAULT 0,
	"avg_satisfaction_score" numeric(5, 2),
	"calculated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"old_status" varchar(50),
	"new_status" varchar(50) NOT NULL,
	"change_reason" text,
	"changed_by" varchar(100),
	"changed_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(50) NOT NULL,
	"categories" text[] DEFAULT '{}'::text[],
	"name" varchar(200) NOT NULL,
	"legal_name" varchar(200),
	"tax_id" varchar(50),
	"website" varchar(200),
	"email" varchar(100),
	"phone" varchar(20),
	"address" text,
	"logo_url" text,
	"description" text,
	"is_active" boolean DEFAULT true,
	"partner_subcategory" varchar(100),
	"partnership_level" varchar(50),
	"partnership_start_date" date,
	"partnership_status" varchar(50) DEFAULT 'actif',
	"annual_budget_tnd" integer,
	"satisfaction_score" integer,
	"num_employees" integer,
	"country" varchar(100) DEFAULT 'Tunisie',
	"location" varchar(255),
	"contract_end_date" date,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_recruitments" (
	"id" serial PRIMARY KEY NOT NULL,
	"university_partner_id" integer NOT NULL,
	"student_first_name" varchar(100),
	"student_last_name" varchar(100),
	"student_email" varchar(100),
	"student_phone" varchar(50),
	"recruitment_type" varchar(50),
	"contract_duration_months" integer,
	"start_date" date NOT NULL,
	"end_date" date,
	"degree_level" varchar(50),
	"specialization" varchar(255),
	"skills" text[],
	"assigned_project" varchar(255),
	"assigned_team" varchar(100),
	"manager_name" varchar(255),
	"manager_email" varchar(100),
	"performance_score" integer,
	"satisfaction_score" integer,
	"converted_to_cdi" boolean DEFAULT false,
	"cdi_start_date" date,
	"cdi_salary_range" varchar(50),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "technology_partners" (
	"partner_id" integer PRIMARY KEY NOT NULL,
	"vendor_type" varchar(100),
	"technologies" text[],
	"certifications_held" integer,
	"certification_level" varchar(50),
	"partnership_model" varchar(50),
	"commission_rate" numeric,
	"discount_rate" numeric,
	"annual_revenue_generated" numeric(18, 0),
	"num_projects_per_year" integer,
	"num_licenses_sold" integer,
	"comarketing_budget_annual" integer,
	"num_events_organized" integer,
	"has_master_agreement" boolean DEFAULT false,
	"agreement_signed_date" date,
	"agreement_renewal_date" date,
	"has_dedicated_support" boolean DEFAULT false,
	"support_sla_hours" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "university_partners" (
	"partner_id" integer PRIMARY KEY NOT NULL,
	"institution_type" varchar(100),
	"num_students" integer,
	"specialties" text[],
	"num_interns_per_year" integer,
	"num_apprentices_per_year" integer,
	"num_hires_per_year" integer,
	"conversion_rate_to_cdi" numeric,
	"average_hire_duration_months" integer,
	"annual_sponsorship_budget" integer,
	"budget_breakdown" jsonb,
	"num_events_per_year" integer,
	"last_event_date" date,
	"has_framework_agreement" boolean DEFAULT false,
	"agreement_signed_date" date,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text,
	"name" varchar(255) NOT NULL,
	"image" text,
	"email_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vendor_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"technology_partner_id" integer NOT NULL,
	"project_name" varchar(255) NOT NULL,
	"project_description" text,
	"client_name" varchar(255),
	"project_type" varchar(100),
	"technologies_used" text[],
	"start_date" date NOT NULL,
	"end_date" date,
	"duration_months" integer,
	"project_value" bigint,
	"license_cost" bigint,
	"services_cost" bigint,
	"commission_earned" integer,
	"delivery_status" varchar(50),
	"delay_days" integer,
	"budget_variance_percentage" numeric,
	"client_satisfaction_score" integer,
	"num_consultants_capgemini" integer,
	"num_consultants_vendor" integer,
	"project_status" varchar(50) DEFAULT 'en_cours',
	"is_reference_project" boolean DEFAULT false,
	"case_study_url" varchar(500),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "client_partners" ADD CONSTRAINT "client_partners_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_partners" ADD CONSTRAINT "marketing_partners_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_contacts" ADD CONSTRAINT "partner_contacts_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_events" ADD CONSTRAINT "partner_events_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_kpis" ADD CONSTRAINT "partner_kpis_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_status_history" ADD CONSTRAINT "partner_status_history_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_recruitments" ADD CONSTRAINT "student_recruitments_university_partner_id_university_partners_partner_id_fk" FOREIGN KEY ("university_partner_id") REFERENCES "public"."university_partners"("partner_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technology_partners" ADD CONSTRAINT "technology_partners_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_partners" ADD CONSTRAINT "university_partners_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_projects" ADD CONSTRAINT "vendor_projects_technology_partner_id_technology_partners_partner_id_fk" FOREIGN KEY ("technology_partner_id") REFERENCES "public"."technology_partners"("partner_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "verification_tokens_user_id_idx" ON "verification_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_tokens_token_idx" ON "verification_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_client_partners_partner" ON "client_partners" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "idx_marketing_partners_partner" ON "marketing_partners" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "idx_offers_partner" ON "offers" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "idx_offers_dates" ON "offers" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "idx_partner_contacts_partner" ON "partner_contacts" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "idx_partner_events_partner" ON "partner_events" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "idx_partner_events_date" ON "partner_events" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "idx_partner_kpis_partner" ON "partner_kpis" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "idx_partner_kpis_period" ON "partner_kpis" USING btree ("year","quarter","month");--> statement-breakpoint
CREATE INDEX "idx_partner_status_history_partner" ON "partner_status_history" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "idx_partner_status_history_date" ON "partner_status_history" USING btree ("changed_at");--> statement-breakpoint
CREATE INDEX "idx_partners_category" ON "partners" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_partners_status" ON "partners" USING btree ("partnership_status");--> statement-breakpoint
CREATE INDEX "idx_partners_location" ON "partners" USING btree ("location");--> statement-breakpoint
CREATE INDEX "idx_student_recruitments_university" ON "student_recruitments" USING btree ("university_partner_id");--> statement-breakpoint
CREATE INDEX "idx_student_recruitments_dates" ON "student_recruitments" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_vendor_projects_technology" ON "vendor_projects" USING btree ("technology_partner_id");--> statement-breakpoint
CREATE INDEX "idx_vendor_projects_status" ON "vendor_projects" USING btree ("project_status");--> statement-breakpoint
CREATE INDEX "idx_vendor_projects_dates" ON "vendor_projects" USING btree ("start_date","end_date");