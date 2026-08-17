CREATE TABLE public.matching_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  busqueda_id uuid REFERENCES public.busquedas(id) ON DELETE SET NULL,
  criterios_snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matching_runs TO authenticated;
GRANT ALL ON public.matching_runs TO service_role;
ALTER TABLE public.matching_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access" ON public.matching_runs FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.matching_results ADD COLUMN matching_run_id uuid REFERENCES public.matching_runs(id) ON DELETE CASCADE;
ALTER TABLE public.matching_results ADD COLUMN razones text;

ALTER TABLE public.matching_results DROP CONSTRAINT matching_results_busqueda_id_fkey;
ALTER TABLE public.matching_results ADD CONSTRAINT matching_results_busqueda_id_fkey FOREIGN KEY (busqueda_id) REFERENCES public.busquedas(id) ON DELETE SET NULL;