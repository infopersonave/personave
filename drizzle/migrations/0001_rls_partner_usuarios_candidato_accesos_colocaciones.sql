alter table partner_usuarios enable row level security;

alter table candidato_accesos enable row level security;

alter table colocaciones enable row level security;

create policy "solo usuarios autenticados" on partner_usuarios for all to authenticated using (true) with check (true);

create policy "solo usuarios autenticados" on candidato_accesos for all to authenticated using (true) with check (true);

create policy "solo usuarios autenticados" on colocaciones for all to authenticated using (true) with check (true);