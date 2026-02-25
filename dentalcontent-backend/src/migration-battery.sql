-- ============================================================
-- DentalContent Pro — Migration: Edição + Bateria de Conteúdo
-- ============================================================

-- Marca se o conteúdo foi editado manualmente após geração
ALTER TABLE contents ADD COLUMN IF NOT EXISTS edited BOOLEAN NOT NULL DEFAULT false;

-- Referência à bateria que gerou este conteúdo (nullable)
ALTER TABLE contents ADD COLUMN IF NOT EXISTS battery_id UUID;

-- BATTERIES — planos editoriais mensais
CREATE TABLE IF NOT EXISTS batteries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month       INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year        INTEGER NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','generated')),
  suggestion  JSONB,        -- sugestão bruta da IA (array de itens)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_batteries_user_id    ON batteries(user_id);
CREATE INDEX IF NOT EXISTS idx_batteries_profile_id ON batteries(profile_id);
CREATE INDEX IF NOT EXISTS idx_contents_battery_id  ON contents(battery_id);

CREATE OR REPLACE TRIGGER trg_batteries_updated_at
  BEFORE UPDATE ON batteries FOR EACH ROW EXECUTE FUNCTION set_updated_at();
