ALTER TABLE public.candidatos
  ADD COLUMN IF NOT EXISTS edad integer,
  ADD COLUMN IF NOT EXISTS salario_esperado_usd numeric,
  ADD COLUMN IF NOT EXISTS pais text,
  ADD COLUMN IF NOT EXISTS region text;