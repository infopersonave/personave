alter table busquedas

  add column if not exists updated_by text,

  add column if not exists updated_at timestamptz;

alter table candidatos

  add column if not exists updated_by text,

  add column if not exists updated_at timestamptz;