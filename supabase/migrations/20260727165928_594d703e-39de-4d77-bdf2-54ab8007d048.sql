
CREATE TABLE public.candidatos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo text NOT NULL,
  email text,
  telefono text,
  ubicacion text,
  anos_experiencia int,
  industria_principal text,
  skills text,
  resumen_ia text,
  estado text NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','colocado')),
  link_cv text,
  linkedin text,
  origen text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidatos TO authenticated;
GRANT ALL ON public.candidatos TO service_role;
ALTER TABLE public.candidatos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access" ON public.candidatos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.busquedas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_contacto text,
  empresa text NOT NULL,
  email text,
  telefono text,
  posicion_buscada text,
  seniority text,
  skills_requeridos text,
  skills_deseables text,
  anos_experiencia int,
  industria_principal text,
  modalidad text,
  cargo text,
  num_vacantes int,
  ubicacion text,
  rango_salarial text,
  descripcion_rol text,
  reporte_matches_ia text,
  estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','cerrado','declinado')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.busquedas TO authenticated;
GRANT ALL ON public.busquedas TO service_role;
ALTER TABLE public.busquedas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access" ON public.busquedas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.damnificados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo text,
  telefono text,
  correo text,
  zona_ubicacion text,
  que_sabe_hacer text,
  disponibilidad text,
  categoria text,
  cv_link text,
  fecha_registro timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.damnificados TO authenticated;
GRANT ALL ON public.damnificados TO service_role;
ALTER TABLE public.damnificados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access" ON public.damnificados FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.compras_guia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha timestamptz NOT NULL DEFAULT now(),
  nombre text,
  email text,
  telefono text,
  monto_bs numeric,
  referencia_pago text,
  comprobante_url text,
  estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aprobado','rechazado')),
  enviado boolean NOT NULL DEFAULT false,
  respuesta_envio text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compras_guia TO authenticated;
GRANT ALL ON public.compras_guia TO service_role;
ALTER TABLE public.compras_guia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access" ON public.compras_guia FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.matching_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  busqueda_id uuid REFERENCES public.busquedas(id) ON DELETE CASCADE,
  candidato_id uuid REFERENCES public.candidatos(id) ON DELETE CASCADE,
  nivel_match text CHECK (nivel_match IN ('Alto','Medio','Bajo')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matching_results TO authenticated;
GRANT ALL ON public.matching_results TO service_role;
ALTER TABLE public.matching_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access" ON public.matching_results FOR ALL TO authenticated USING (true) WITH CHECK (true);
