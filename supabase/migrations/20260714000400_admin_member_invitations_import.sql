-- Import CSV et invitations adherents : garde-fous non destructifs.

create unique index if not exists member_invitations_pending_email_unique_idx
on public.member_invitations(lower(email))
where status = 'pending';

create index if not exists member_invitations_metadata_idx
on public.member_invitations
using gin(metadata);
