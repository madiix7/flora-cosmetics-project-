-- Extensions required for full-text and trigram search
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Trigram indexes are created by Prisma migration; this ensures the extension
-- is available before Prisma runs migrate deploy in CI.
