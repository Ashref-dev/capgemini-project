CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed');--> statement-breakpoint
ALTER TABLE "partners" RENAME COLUMN "category" TO "annual_revenue_generated";--> statement-breakpoint
DROP INDEX "idx_partners_category";--> statement-breakpoint
DROP INDEX "idx_partners_location";--> statement-breakpoint
ALTER TABLE "offers" ALTER COLUMN "discount_type" SET DATA TYPE "public"."discount_type" USING "discount_type"::"public"."discount_type";--> statement-breakpoint
ALTER TABLE "offers" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "offers" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "offers" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "offers" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "offers" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "offers" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "partner_contacts" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "partner_contacts" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "partner_contacts" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "partner_contacts" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "partner_contacts" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "partner_contacts" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "partner_events" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "partner_events" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "partner_events" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "partner_events" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "partner_events" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "partner_events" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "partners" ALTER COLUMN "categories" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "partners" ALTER COLUMN "categories" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "partners" ALTER COLUMN "annual_budget_tnd" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "partners" ALTER COLUMN "num_employees" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "partners" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "partners" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "partners" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "partner_events" ADD COLUMN "event_revenue" integer;--> statement-breakpoint
ALTER TABLE "partner_events" ADD COLUMN "roi_event" double precision;--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "last_event_date" date;--> statement-breakpoint
ALTER TABLE "offers" DROP COLUMN "discount_value";--> statement-breakpoint
ALTER TABLE "partners" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "partners" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "partners" DROP COLUMN "created_at";