-- =============================================
-- Rafa Finance - Supabase Database Setup
-- Execute no Supabase SQL Editor: Project > SQL Editor > New Query
-- =============================================

-- 1. Tipo enum para plantão/consulta
CREATE TYPE tipo_atendimento AS ENUM ('Plantão', 'Consulta');

-- 2. Tabela principal
CREATE TABLE IF NOT EXISTS public.atendimentos (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_atendimento         DATE NOT NULL,
  tipo                     tipo_atendimento NOT NULL,
  tempo                    TEXT NOT NULL,
  local                    TEXT NOT NULL,
  valor_a_receber          NUMERIC(10, 2) NOT NULL CHECK (valor_a_receber >= 0),
  data_prevista_pagamento  DATE NOT NULL,
  data_recebimento         DATE,
  valor_recebido           NUMERIC(10, 2) CHECK (valor_recebido IS NULL OR valor_recebido >= 0),
  banco                    TEXT,

  -- Se data_recebimento for preenchida, valor_recebido também deve ser
  CONSTRAINT received_fields_consistent CHECK (
    (data_recebimento IS NULL AND valor_recebido IS NULL)
    OR
    (data_recebimento IS NOT NULL AND valor_recebido IS NOT NULL)
  )
);

-- 3. View com status computado (não armazenado na tabela)
CREATE OR REPLACE VIEW public.atendimentos_view AS
SELECT
  id,
  created_at,
  data_atendimento,
  tipo,
  tempo,
  local,
  valor_a_receber,
  data_prevista_pagamento,
  data_recebimento,
  valor_recebido,
  banco,
  CASE
    WHEN data_recebimento IS NULL THEN 'Pendente'::TEXT
    ELSE 'Recebido'::TEXT
  END AS status
FROM public.atendimentos;

-- 4. Row Level Security — apenas usuários autenticados têm acesso
ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_full_access"
  ON public.atendimentos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Permissões da view (anon não pode ler)
REVOKE SELECT ON public.atendimentos_view FROM anon, public;
GRANT SELECT ON public.atendimentos_view TO authenticated;

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_atendimentos_data
  ON public.atendimentos (data_atendimento DESC);

CREATE INDEX IF NOT EXISTS idx_atendimentos_pending
  ON public.atendimentos (data_prevista_pagamento ASC)
  WHERE data_recebimento IS NULL;

CREATE INDEX IF NOT EXISTS idx_atendimentos_recebimento
  ON public.atendimentos (data_recebimento DESC)
  WHERE data_recebimento IS NOT NULL;

-- =============================================
-- MIGRAÇÃO: Tabela de categorias de atendimento
-- Execute este bloco no Supabase SQL Editor após o script inicial
-- =============================================

-- 7. Tabela de categorias (tipo + tempo pré-definidos)
CREATE TABLE IF NOT EXISTS public.categorias (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  nome       TEXT NOT NULL,              -- ex: "Plantão 12h"
  tipo       tipo_atendimento NOT NULL,
  tempo      TEXT NOT NULL,
  ordem      INT NOT NULL DEFAULT 0
);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_full_access"
  ON public.categorias
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Categorias padrão
INSERT INTO public.categorias (nome, tipo, tempo, ordem) VALUES
  ('Consulta 30min', 'Consulta', '30min', 1),
  ('Consulta 1h',    'Consulta', '1h',    2),
  ('Plantão 4h',     'Plantão',  '4h',    3),
  ('Plantão 6h',     'Plantão',  '6h',    4),
  ('Plantão 12h',    'Plantão',  '12h',   5);


-- =============================================
-- MIGRAÇÃO: Campos paciente e observações
-- Execute este bloco no Supabase SQL Editor após os blocos anteriores
-- =============================================

ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS paciente TEXT;
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Recriar view incluindo novos campos (drop necessário por mudança na ordem das colunas)
DROP VIEW IF EXISTS public.atendimentos_view;
CREATE VIEW public.atendimentos_view AS
SELECT
  id,
  created_at,
  data_atendimento,
  tipo,
  tempo,
  local,
  paciente,
  observacoes,
  valor_a_receber,
  data_prevista_pagamento,
  data_recebimento,
  valor_recebido,
  banco,
  CASE
    WHEN data_recebimento IS NULL THEN 'Pendente'::TEXT
    ELSE 'Recebido'::TEXT
  END AS status
FROM public.atendimentos;

-- Reaplicar permissões da view
REVOKE SELECT ON public.atendimentos_view FROM anon, public;
GRANT SELECT ON public.atendimentos_view TO authenticated;
