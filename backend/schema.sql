-- Schema do SESMT APP
-- Tabela única: profissionais. Todos os campos de conteúdo são texto.

CREATE TABLE IF NOT EXISTS profissionais (
  id              SERIAL PRIMARY KEY,
  projeto         TEXT NOT NULL,
  data            DATE,
  responsavel     TEXT,
  epc_epcm        TEXT,   -- "EPC/EPCM ou Contrato Direto"
  contratada      TEXT,
  subcontratada   TEXT,
  ilha            TEXT,   -- "Ilha/Local"
  efetivo         TEXT,   -- "Efetivo da Ilha/Local"
  nome            TEXT,
  cargo           TEXT,
  telefone        TEXT,
  email           TEXT,
  observacao      TEXT,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Migração idempotente para bancos já existentes (colunas novas desta versão).
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS contratada TEXT;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS efetivo    TEXT;
