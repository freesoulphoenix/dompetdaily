alter table public.receipts
add column if not exists file_storage_path text;

alter table public.receipts
add column if not exists file_retention_expires_at timestamptz;

alter table public.receipts
add column if not exists file_deleted_at timestamptz;

update public.receipts
set file_storage_path = split_part(substring(image_url from '/storage/v1/object/public/receipts/(.*)$'), '?', 1)
where file_storage_path is null
  and image_url like '%/storage/v1/object/public/receipts/%';

update public.receipts
set file_retention_expires_at = coalesce(created_at, now()) + interval '90 days'
where file_retention_expires_at is null;

alter table public.receipts
alter column file_retention_expires_at set default (now() + interval '90 days');

alter table public.receipts
alter column file_retention_expires_at set not null;

create index if not exists receipts_file_retention_expires_at_idx
on public.receipts (file_retention_expires_at)
where file_deleted_at is null
  and image_url is not null;

alter table public.statement_imports
add column if not exists file_storage_path text;

alter table public.statement_imports
add column if not exists file_retention_expires_at timestamptz;

alter table public.statement_imports
add column if not exists file_deleted_at timestamptz;

update public.statement_imports
set file_storage_path = split_part(substring(file_url from '/storage/v1/object/public/statements/(.*)$'), '?', 1)
where file_storage_path is null
  and file_url like '%/storage/v1/object/public/statements/%';

update public.statement_imports
set file_retention_expires_at = coalesce(created_at, now()) + interval '90 days'
where file_retention_expires_at is null;

alter table public.statement_imports
alter column file_retention_expires_at set default (now() + interval '90 days');

alter table public.statement_imports
alter column file_retention_expires_at set not null;

create index if not exists statement_imports_file_retention_expires_at_idx
on public.statement_imports (file_retention_expires_at)
where file_deleted_at is null
  and file_url is not null;

notify pgrst, 'reload schema';
