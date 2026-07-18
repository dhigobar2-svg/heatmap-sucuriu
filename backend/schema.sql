-- Schema do SESMT APP
-- Tabela única: profissionais. Todos os campos de conteúdo são texto.

CREATE TABLE IF NOT EXISTS profissionais (
  id              SERIAL PRIMARY KEY,
  projeto         TEXT NOT NULL,
  data            DATE,
  responsavel     TEXT,
  epc_epcm        TEXT,
  contrato_direto TEXT,
  subcontratada   TEXT,
  ilha            TEXT,
  local           TEXT,
  nome            TEXT,
  cargo           TEXT,
  telefone        TEXT,
  email           TEXT,
  situacao        TEXT,
  observacao      TEXT,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
