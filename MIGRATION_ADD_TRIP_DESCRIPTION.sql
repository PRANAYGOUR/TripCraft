-- Migration: Add `description` column to `trips` table
-- Run this in Supabase SQL editor or via psql

ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Ensure existing rows explicitly have NULL (column defaults to NULL anyway)
UPDATE trips SET description = NULL WHERE description IS NULL;

-- Optional: add an index if you plan to search descriptions (skip for now)
-- CREATE INDEX idx_trips_description ON trips USING gin (to_tsvector('english', COALESCE(description, '')));
