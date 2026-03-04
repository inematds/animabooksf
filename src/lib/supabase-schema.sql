-- Animabook SF - Supabase Schema
-- Execute este SQL no Supabase SQL Editor

-- Historias
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author_id UUID,
  data JSONB NOT NULL,
  thumbnail_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Assets (sprites e fundos)
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  filename TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sprite', 'background')),
  character_id TEXT,
  tags TEXT[],
  width INT,
  height INT,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_stories_published ON stories(published);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_character ON assets(character_id);

-- RLS (Row Level Security) - desabilitado para MVP
-- ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Storage buckets (executar via Supabase Dashboard ou API):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('sprites', 'sprites', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('backgrounds', 'backgrounds', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);
