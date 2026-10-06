CREATE TYPE "public"."notification_type" AS ENUM('feedback_created', 'feedback_commented', 'feedback_reopened', 'review_changes_requested', 'review_approved');--> statement-breakpoint
CREATE TABLE "notification_read" (
	"notification_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"read_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_read_notification_id_user_id_pk" PRIMARY KEY("notification_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"project_id" uuid,
	"feedback_id" uuid,
	"project_review_id" uuid,
	"title" text NOT NULL,
	"body" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_read" ADD CONSTRAINT "notification_read_notification_id_notification_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notification"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_read" ADD CONSTRAINT "notification_read_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_feedback_id_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_project_review_id_project_review_id_fk" FOREIGN KEY ("project_review_id") REFERENCES "public"."project_review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_read_user_id_idx" ON "notification_read" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_organization_created_at_idx" ON "notification" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "notification_project_id_idx" ON "notification" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "notification_feedback_id_idx" ON "notification" USING btree ("feedback_id");--> statement-breakpoint
CREATE INDEX "notification_project_review_id_idx" ON "notification" USING btree ("project_review_id");