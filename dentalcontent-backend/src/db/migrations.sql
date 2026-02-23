-- ============================================================
-- DentalContent Pro — Migrations
-- Compatível com PostgreSQL / Supabase
-- ============================================================

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  plan          VARCHAR(20) NOT NULL DEFAULT 'essencial' CHECK (plan IN ('essencial', 'pro', 'clinica')),
  stripe_customer_id VARCHAR(255),
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- PROFILES (perfil odontológico do dentista)
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  subniche        VARCHAR(20) NOT NULL CHECK (subniche IN ('estetico', 'implante')),
  city            VARCHAR(255) NOT NULL,
  preferred_tone  VARCHAR(20) NOT NULL DEFAULT 'acessivel' CHECK (preferred_tone IN ('formal', 'acessivel', 'tecnico', 'humanizado')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- CONTENTS (conteúdos gerados)
CREATE TABLE IF NOT EXISTS contents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_type      VARCHAR(30) NOT NULL CHECK (content_type IN ('educativo','autoridade','quebra_objecao','bastidores','depoimento','procedimento')),
  theme             VARCHAR(500) NOT NULL,
  objective         VARCHAR(30) NOT NULL CHECK (objective IN ('atrair_pacientes','educar','construir_autoridade')),
  tone              VARCHAR(20) NOT NULL CHECK (tone IN ('formal','acessivel','tecnico','humanizado')),
  -- output estruturado (JSON)
  headlines         JSONB,
  caption           TEXT,
  short_version     TEXT,
  hashtags          JSONB,
  carousel          JSONB,
  -- kanban
  status            VARCHAR(20) NOT NULL DEFAULT 'generated' CHECK (status IN ('idea','generated','approved','scheduled','published')),
  scheduled_date    DATE,
  published_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contents_user_id     ON contents(user_id);
CREATE INDEX IF NOT EXISTS idx_contents_profile_id  ON contents(profile_id);
CREATE INDEX IF NOT EXISTS idx_contents_status       ON contents(status);
CREATE INDEX IF NOT EXISTS idx_contents_scheduled    ON contents(scheduled_date);

-- GENERATIONS (controle de limite por plano)
CREATE TABLE IF NOT EXISTS generations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id  UUID REFERENCES contents(id) ON DELETE SET NULL,
  tokens_used INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generations_user_id    ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at);

-- Função utilitária: updated_at automático
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_contents_updated_at
  BEFORE UPDATE ON contents FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- PASSWORD RESETS
CREATE TABLE IF NOT EXISTS password_resets (
  user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
