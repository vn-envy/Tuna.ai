-- 0001_extensions.sql
-- Extensions required by Tuna. Run as a Postgres superuser.

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
