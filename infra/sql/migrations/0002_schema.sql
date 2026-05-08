-- 0002_schema.sql
-- Core Tuna data model.

CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT UNIQUE NOT NULL,
  display_name   TEXT,
  settings_json  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trips (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status               TEXT NOT NULL CHECK (status IN (
    'drafting','awaiting_intent_confirm','researching','planning',
    'awaiting_plan_approval','approved','monitoring',
    'awaiting_replan_approval','traveled','cancelled'
  )),
  intent_json          JSONB,
  plan_json            JSONB,
  baseline_costs_json  JSONB,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at          TIMESTAMPTZ,
  traveled_at          TIMESTAMPTZ,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trips_user_status_idx ON trips(user_id, status);
CREATE INDEX IF NOT EXISTS trips_active_monitor_idx ON trips(status, traveled_at)
  WHERE status IN ('approved','monitoring');

CREATE TABLE IF NOT EXISTS trip_events (
  id           BIGSERIAL PRIMARY KEY,
  trip_id      UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  ts           TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type   TEXT NOT NULL,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS trip_events_trip_ts_idx ON trip_events(trip_id, ts DESC);
CREATE INDEX IF NOT EXISTS trip_events_type_idx ON trip_events(event_type, ts DESC);

CREATE TABLE IF NOT EXISTS trip_embeddings (
  trip_id    UUID PRIMARY KEY REFERENCES trips(id) ON DELETE CASCADE,
  embedding  vector(3072),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- pgvector ivfflat index for trips
-- (note: lists tuning is approximate; revisit at scale)
CREATE INDEX IF NOT EXISTS trip_embeddings_ivfflat_idx
  ON trip_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_type    TEXT NOT NULL CHECK (source_type IN (
    'instagram','tiktok','youtube','x','reddit','blog','manual','chat','other'
  )),
  source_url     TEXT,
  capture_method TEXT NOT NULL CHECK (capture_method IN ('paste_link','manual','chat','desktop')),
  captured_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- extracted fields
  location_text  TEXT,
  location_geo   geography(POINT, 4326),
  vibe_tags      TEXT[] NOT NULL DEFAULT '{}',
  price_band     TEXT CHECK (price_band IS NULL OR price_band IN ('$','$$','$$$','$$$$')),
  season_hint    TEXT,
  hook           TEXT,

  -- raw + user input
  raw_text       TEXT,
  user_note      TEXT,

  -- semantic retrieval
  embedding      vector(3072),

  -- lifecycle
  traveled_to    BOOLEAN NOT NULL DEFAULT FALSE,
  traveled_to_trip_id UUID REFERENCES trips(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS wishlist_user_captured_idx
  ON wishlist_items(user_id, captured_at DESC);

CREATE INDEX IF NOT EXISTS wishlist_geo_idx
  ON wishlist_items USING GIST (location_geo);

CREATE INDEX IF NOT EXISTS wishlist_embedding_idx
  ON wishlist_items USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS wishlist_vibes_idx
  ON wishlist_items USING GIN (vibe_tags);

-- updated_at trigger for trips
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trips_set_updated_at ON trips;
CREATE TRIGGER trips_set_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
