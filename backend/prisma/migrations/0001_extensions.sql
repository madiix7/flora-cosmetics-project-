-- Required before Prisma creates tables — must run in a raw migration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- GIN trigram index for fuzzy fallback search
-- (Prisma cannot generate GIN indexes natively; add them here)
-- These are applied after the main migration creates the perfumes table.
