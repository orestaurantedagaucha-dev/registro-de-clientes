-- Adicionar coluna created_at na tabela clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

-- Preencher registros existentes com a data atual
UPDATE clientes SET created_at = NOW() WHERE created_at IS NULL;

-- Opcional: definir valor padrão para novos registros
ALTER TABLE clientes ALTER COLUMN created_at SET DEFAULT NOW();