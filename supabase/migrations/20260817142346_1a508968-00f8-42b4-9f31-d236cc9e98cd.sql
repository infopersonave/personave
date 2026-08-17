ALTER TABLE public.busquedas DROP CONSTRAINT IF EXISTS busquedas_estado_check;

UPDATE public.busquedas SET estado = 'matching_realizado' WHERE estado = 'matching_listo';

UPDATE public.busquedas SET
  telefono_contacto = telefono,
  cargo_contacto = cargo,
  anos_experiencia_minimos = anos_experiencia,
  industria_preferida = industria_principal;

ALTER TABLE public.busquedas DROP COLUMN telefono;
ALTER TABLE public.busquedas DROP COLUMN cargo;
ALTER TABLE public.busquedas DROP COLUMN anos_experiencia;
ALTER TABLE public.busquedas DROP COLUMN industria_principal;

ALTER TABLE public.busquedas ADD CONSTRAINT busquedas_estado_check
  CHECK (estado IN ('pendiente', 'declinado', 'aprobado_para_matching', 'matching_realizado', 'cerrado'));