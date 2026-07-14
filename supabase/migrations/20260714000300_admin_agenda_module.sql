-- Module admin Agenda : durcissement non destructif du modèle events.

create index if not exists events_visible_status_starts_idx
on public.events(visible_public, statut, starts_at);

create index if not exists events_scheduled_for_idx
on public.events(scheduled_for)
where statut = 'scheduled';

drop policy if exists "events_manager_all" on public.events;

create policy "events_manager_all"
on public.events
for all
using (public.is_manager())
with check (public.is_manager());
