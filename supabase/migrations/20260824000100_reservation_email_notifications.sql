create table if not exists public.reservation_email_notifications (
  reservation_id bigint primary key references public.reservations(id) on delete cascade,
  recipients text[] not null default '{}',
  sent_at timestamptz not null default now()
);

alter table public.reservation_email_notifications enable row level security;
revoke all on table public.reservation_email_notifications from anon, authenticated;

comment on table public.reservation_email_notifications is
  'Journal serveur empêchant le double envoi des emails de nouvelle réservation.';
