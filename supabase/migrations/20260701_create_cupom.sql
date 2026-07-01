-- Criar tabela cupom para armazenar cupons impressos
CREATE TABLE IF NOT EXISTS cupom (
  id BIGSERIAL PRIMARY KEY,
  cliente_nome TEXT NOT NULL,
  cliente_endereco TEXT,
  cliente_telefone TEXT,
  valor NUMERIC NOT NULL,
  esta_pago BOOLEAN NOT NULL DEFAULT false,
  deve_cobrar BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para busca por data (opcional, útil para consultas futuras)
CREATE INDEX IF NOT EXISTS idx_cupom_created_at ON cupom (created_at DESC);