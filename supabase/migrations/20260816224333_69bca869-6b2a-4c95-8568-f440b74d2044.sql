ALTER TABLE public.busquedas ADD COLUMN IF NOT EXISTS genero_buscado text;
ALTER TABLE public.busquedas DROP CONSTRAINT IF EXISTS busquedas_estado_check;
ALTER TABLE public.busquedas ADD CONSTRAINT busquedas_estado_check CHECK (estado IN ('pendiente', 'cerrado', 'declinado', 'matching_listo'));