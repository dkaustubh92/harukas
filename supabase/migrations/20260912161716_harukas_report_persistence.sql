-- HaruKas report persistence is server-mediated. Keep the service-role
-- credential server-only before enabling the adapter in another environment.
-- Verification: inspect the table grants/RLS and bucket row after applying;
-- run the adapter's insert, compare-and-swap update, and action-retry checks.

create table public.harukas_reports (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  client_submission_id text not null unique,
  version integer not null check (version > 0),
  status text not null check (
    status in ('submitted', 'reviewed', 'inspection_requested', 'response_assigned', 'resolved')
  ),
  priority text not null check (priority in ('urgent', 'priority', 'routine', 'unassessed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  document jsonb not null,
  action_receipts jsonb not null default '{}'::jsonb,
  constraint harukas_reports_document_consistency_check check (
    (
      document->>'id' = id::text
      and document->>'reference' = reference
      and document->>'clientSubmissionId' = client_submission_id
      and (document->>'version')::integer = version
      and document->>'status' = status
      and document->>'effectivePriority' = priority
      and (document->>'isDemo')::boolean is true
      and document->>'municipalStatus' = 'not_sent'
    ) is true
  ),
  constraint harukas_reports_action_receipts_object_check check (
    jsonb_typeof(action_receipts) = 'object'
  )
);

create index harukas_reports_status_priority_created_at_idx
  on public.harukas_reports (status, priority, created_at);

create index harukas_reports_updated_at_idx
  on public.harukas_reports (updated_at);

alter table public.harukas_reports enable row level security;

revoke all on table public.harukas_reports from public, anon, authenticated;
grant select, insert, update, delete on table public.harukas_reports to service_role;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'harukas-report-photos',
  'harukas-report-photos',
  false,
  2097152,
  array['image/jpeg']::text[]
)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
