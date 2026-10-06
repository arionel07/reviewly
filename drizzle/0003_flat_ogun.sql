CREATE TYPE "public"."project_review_status" AS ENUM('pending', 'changes_requested', 'approved');--> statement-breakpoint
CREATE TABLE "project_review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"status" "project_review_status" NOT NULL,
	"requested_at" timestamp NOT NULL,
	"decided_at" timestamp,
	"decision_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_review" ADD CONSTRAINT "project_review_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_review_project_id_idx" ON "project_review" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_review_project_requested_at_idx" ON "project_review" USING btree ("project_id","requested_at");--> statement-breakpoint
CREATE UNIQUE INDEX "project_review_one_pending_project_idx" ON "project_review" USING btree ("project_id") WHERE "project_review"."status" = 'pending';