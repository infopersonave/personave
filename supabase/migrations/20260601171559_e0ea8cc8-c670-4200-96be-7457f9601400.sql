
insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', true)
on conflict (id) do update set public = true;

create policy "Public can upload CVs"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'cvs');

create policy "Public can read CVs"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'cvs');
