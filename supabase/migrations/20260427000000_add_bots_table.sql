CREATE TABLE IF NOT EXISTS "bots" (
  "id"            uuid        NOT NULL DEFAULT gen_random_uuid(),
  "profileId"     uuid        REFERENCES "Profile"("id") ON DELETE SET NULL,
  "username"      text        NOT NULL,
  "password_hash" text        NOT NULL,
  "is_active"     boolean     NOT NULL DEFAULT true,
  "created_at"    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT "bots_pkey"         PRIMARY KEY ("id"),
  CONSTRAINT "bots_username_key" UNIQUE      ("username")
);

CREATE INDEX IF NOT EXISTS "bots_profileId_idx" ON "bots" ("profileId");

ALTER TABLE "bots" ENABLE ROW LEVEL SECURITY;
