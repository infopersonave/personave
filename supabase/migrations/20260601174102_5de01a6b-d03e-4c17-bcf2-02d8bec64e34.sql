-- Remove anonymous upload policy; uploads now go through server function using service role
DROP POLICY IF EXISTS "Public can upload CVs" ON storage.objects;

-- Note: service_role bypasses RLS, so server-side uploads/reads/deletes still work.
-- No SELECT/INSERT/UPDATE/DELETE policies are defined for cvs bucket,
-- which means anon and authenticated users cannot touch the objects directly.