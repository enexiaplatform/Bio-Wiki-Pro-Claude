-- Standalone reconciliation 20260905: reviewed against the names-only audit.
-- Apply only when exactly these two tables are absent and all other runtime
-- objects match. Execute through script/repair-runtime-schema.ts in one
-- transaction. This does not reconcile or advance the historical Drizzle ledger.
CREATE TABLE "public"."quality_lab_funnel_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "event_id" text NOT NULL,
  "journey_id" text NOT NULL,
  "user_id" text,
  "stage" text NOT NULL,
  "source" text,
  "placement" text,
  "destination" text,
  "offer" text,
  "start_mode" text,
  "occurred_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now()
);
CREATE UNIQUE INDEX "quality_lab_funnel_events_event_idx"
  ON "public"."quality_lab_funnel_events" ("event_id");
CREATE INDEX "quality_lab_funnel_events_occurred_idx"
  ON "public"."quality_lab_funnel_events" ("occurred_at");
CREATE INDEX "quality_lab_funnel_events_stage_journey_idx"
  ON "public"."quality_lab_funnel_events" ("stage", "journey_id");

CREATE TABLE "public"."regulatory_alert_preferences" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "cadence" text DEFAULT 'off' NOT NULL,
  "domains" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
CREATE UNIQUE INDEX "regulatory_alert_preferences_user_idx"
  ON "public"."regulatory_alert_preferences" ("user_id");
