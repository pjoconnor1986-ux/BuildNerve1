-- BuildNerve v3.2 launch schema — Supabase/Postgres
create extension if not exists pgcrypto;

create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('company_owner','director','admin','pm','site_manager','site_agent','qs','buyer','engineer','foreman','viewer')),
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  name text not null,
  client text,
  status text not null default 'live',
  contract_value numeric(14,2),
  forecast_value numeric(14,2),
  forecast_cost numeric(14,2),
  programme_percent numeric(5,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.actions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  owner_id uuid references public.profiles(id),
  priority text not null default 'amber' check (priority in ('red','amber','green','Red','Amber','Green')),
  status text not null default 'open',
  due_at timestamptz,
  source_type text,
  source_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.diaries (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  diary_date date not null,
  weather text,
  works text,
  delays text,
  instructions text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(project_id, diary_date)
);

create table if not exists public.permits (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  permit_type text not null,
  area text not null,
  status text not null default 'draft',
  authorised_by uuid references public.profiles(id),
  authorised_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.commercial_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  event_type text not null,
  title text not null,
  value numeric(14,2),
  status text not null default 'identified',
  source_ref text,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  revision text,
  document_type text,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.capture_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  raw_text text not null,
  structured_result jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  actor_type text not null default 'user',
  event_type text not null,
  entity_type text,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_proposals (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  proposal_type text not null,
  payload jsonb not null,
  risk_level text not null default 'low',
  status text not null default 'proposed',
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_org on public.projects(organisation_id);
create index if not exists idx_actions_org_status on public.actions(organisation_id,status);
create index if not exists idx_diaries_project_date on public.diaries(project_id,diary_date desc);
create index if not exists idx_documents_project on public.documents(project_id);
create index if not exists idx_capture_org_project on public.capture_events(organisation_id,project_id,created_at desc);
create index if not exists idx_audit_org_created on public.audit_events(organisation_id,created_at desc);
create index if not exists idx_proposals_org_status on public.agent_proposals(organisation_id,status);
create index if not exists idx_notifications_user on public.notifications(user_id,read_at,created_at desc);

alter table public.organisations enable row level security;
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.actions enable row level security;
alter table public.diaries enable row level security;
alter table public.permits enable row level security;
alter table public.commercial_events enable row level security;
alter table public.documents enable row level security;
alter table public.capture_events enable row level security;
alter table public.audit_events enable row level security;
alter table public.agent_proposals enable row level security;
alter table public.notifications enable row level security;

create or replace function public.current_org_id()
returns uuid
language sql stable security definer
set search_path=public
as $$ select organisation_id from public.profiles where id=auth.uid() limit 1 $$;
revoke all on function public.current_org_id() from public;
grant execute on function public.current_org_id() to authenticated;

create or replace function public.onboard_company(
  p_company_name text,
  p_full_name text,
  p_project_name text,
  p_client text default null
)
returns jsonb
language plpgsql security definer
set search_path=public
as $$
declare new_org uuid; new_project uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if exists(select 1 from public.profiles where id=(select auth.uid())) then raise exception 'Your account already belongs to a company'; end if;
  if length(trim(p_company_name)) < 2 then raise exception 'Enter your company name'; end if;
  if length(trim(p_full_name)) < 2 then raise exception 'Enter your full name'; end if;
  if length(trim(p_project_name)) < 2 then raise exception 'Enter your first project name'; end if;

  insert into public.organisations(name) values(trim(p_company_name)) returning id into new_org;
  insert into public.profiles(id,organisation_id,full_name,role) values((select auth.uid()),new_org,trim(p_full_name),'company_owner');
  insert into public.projects(organisation_id,name,client,status)
    values(new_org,trim(p_project_name),nullif(trim(coalesce(p_client,'')),''),'live') returning id into new_project;
  insert into public.audit_events(organisation_id,project_id,actor_id,actor_type,event_type,entity_type,entity_id,payload)
    values(new_org,new_project,(select auth.uid()),'user','company_onboarded','organisation',new_org,
      jsonb_build_object('company_name',trim(p_company_name),'first_project',trim(p_project_name)));
  return jsonb_build_object('organisation_id',new_org,'project_id',new_project);
end $$;
revoke all on function public.onboard_company(text,text,text,text) from public;
revoke all on function public.onboard_company(text,text,text,text) from anon;
grant execute on function public.onboard_company(text,text,text,text) to authenticated;

-- Tenant policies
drop policy if exists organisations_select on public.organisations;
create policy organisations_select on public.organisations for select to authenticated using (id=public.current_org_id());
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using (organisation_id=public.current_org_id() or id=auth.uid());
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid() and organisation_id=public.current_org_id());

do $$
declare t text;
begin
 foreach t in array array['projects','actions','diaries','permits','commercial_events','documents','capture_events','agent_proposals'] loop
   execute format('drop policy if exists %I on public.%I',t||'_tenant',t);
   execute format('create policy %I on public.%I for all to authenticated using (organisation_id=public.current_org_id()) with check (organisation_id=public.current_org_id())',t||'_tenant',t);
 end loop;
end $$;

drop policy if exists audit_select on public.audit_events;
create policy audit_select on public.audit_events for select to authenticated using (organisation_id=public.current_org_id());
drop policy if exists audit_insert on public.audit_events;
create policy audit_insert on public.audit_events for insert to authenticated with check (organisation_id=public.current_org_id() and actor_id=auth.uid());
drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications for all to authenticated using (user_id=auth.uid() and organisation_id=public.current_org_id()) with check (user_id=auth.uid() and organisation_id=public.current_org_id());

-- Private document bucket + tenant path policies. Object paths start with organisation UUID.
insert into storage.buckets(id,name,public) values('project-documents','project-documents',false) on conflict(id) do update set public=false;

drop policy if exists project_documents_select on storage.objects;
create policy project_documents_select on storage.objects for select to authenticated using (
  bucket_id='project-documents' and (storage.foldername(name))[1]=public.current_org_id()::text
);
drop policy if exists project_documents_insert on storage.objects;
create policy project_documents_insert on storage.objects for insert to authenticated with check (
  bucket_id='project-documents' and (storage.foldername(name))[1]=public.current_org_id()::text
);
drop policy if exists project_documents_update on storage.objects;
create policy project_documents_update on storage.objects for update to authenticated using (
  bucket_id='project-documents' and (storage.foldername(name))[1]=public.current_org_id()::text
) with check (
  bucket_id='project-documents' and (storage.foldername(name))[1]=public.current_org_id()::text
);
drop policy if exists project_documents_delete on storage.objects;
create policy project_documents_delete on storage.objects for delete to authenticated using (
  bucket_id='project-documents' and (storage.foldername(name))[1]=public.current_org_id()::text
);


-- Team invitations and protected company roles
create extension if not exists pgcrypto;

create table if not exists public.team_invitations (
 id uuid primary key default gen_random_uuid(),
 organisation_id uuid not null references public.organisations(id) on delete cascade,
 email text not null,
 role text not null check (role in ('director','admin','pm','site_manager','qs','buyer','viewer')),
 token_hash text not null unique,
 invited_by uuid not null references public.profiles(id),
 expires_at timestamptz not null default (now()+interval '7 days'),
 accepted_at timestamptz,
 accepted_by uuid references public.profiles(id),
 created_at timestamptz not null default now()
);
create index if not exists idx_team_invitations_org on public.team_invitations(organisation_id,created_at desc);
create unique index if not exists idx_team_invitations_active_email on public.team_invitations(organisation_id,lower(email)) where accepted_at is null;
alter table public.team_invitations enable row level security;
revoke all on public.team_invitations from public,anon,authenticated;
grant select on public.team_invitations to authenticated;
drop policy if exists team_invitations_admin_select on public.team_invitations;
create policy team_invitations_admin_select on public.team_invitations for select to authenticated
using(organisation_id=public.current_org_id() and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('company_owner','admin')));

create or replace function public.create_team_invitation(p_email text,p_role text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare inviter public.profiles%rowtype; raw_token text; invite_id uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select * into inviter from public.profiles where id=(select auth.uid());
 if inviter.id is null or inviter.role not in ('company_owner','admin') then raise exception 'Only a Company Owner or Administrator can invite team members'; end if;
 if p_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then raise exception 'Enter a valid email address'; end if;
 if p_role not in ('director','admin','pm','site_manager','qs','buyer','viewer') then raise exception 'Invalid team role'; end if;
 if exists(select 1 from public.profiles p join auth.users u on u.id=p.id where p.organisation_id=inviter.organisation_id and lower(u.email)=lower(trim(p_email))) then raise exception 'This person is already a member'; end if;
 delete from public.team_invitations where organisation_id=inviter.organisation_id and lower(email)=lower(trim(p_email)) and accepted_at is null;
 raw_token=encode(gen_random_bytes(24),'hex');
 insert into public.team_invitations(organisation_id,email,role,token_hash,invited_by)
 values(inviter.organisation_id,lower(trim(p_email)),p_role,encode(digest(raw_token,'sha256'),'hex'),inviter.id) returning id into invite_id;
 insert into public.audit_events(organisation_id,actor_id,actor_type,event_type,entity_type,entity_id,payload)
 values(inviter.organisation_id,inviter.id,'user','team_invitation_created','team_invitation',invite_id,jsonb_build_object('email',lower(trim(p_email)),'role',p_role));
 return jsonb_build_object('id',invite_id,'token',raw_token,'expires_at',now()+interval '7 days');
end $$;

create or replace function public.accept_team_invitation(p_token text,p_full_name text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare invitation public.team_invitations%rowtype; user_email text;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if exists(select 1 from public.profiles where id=(select auth.uid())) then raise exception 'Your account already belongs to a company'; end if;
 select email into user_email from auth.users where id=(select auth.uid());
 select * into invitation from public.team_invitations where token_hash=encode(digest(p_token,'sha256'),'hex') and accepted_at is null and expires_at>now() for update;
 if invitation.id is null then raise exception 'This invitation is invalid or has expired'; end if;
 if lower(coalesce(user_email,''))<>lower(invitation.email) then raise exception 'Sign in using the email address that was invited'; end if;
 if length(trim(p_full_name))<2 then raise exception 'Enter your full name'; end if;
 insert into public.profiles(id,organisation_id,full_name,role) values((select auth.uid()),invitation.organisation_id,trim(p_full_name),invitation.role);
 update public.team_invitations set accepted_at=now(),accepted_by=(select auth.uid()) where id=invitation.id;
 insert into public.audit_events(organisation_id,actor_id,actor_type,event_type,entity_type,entity_id,payload)
 values(invitation.organisation_id,(select auth.uid()),'user','team_invitation_accepted','profile',(select auth.uid()),jsonb_build_object('role',invitation.role));
 return jsonb_build_object('organisation_id',invitation.organisation_id,'role',invitation.role);
end $$;
revoke all on function public.create_team_invitation(text,text) from public,anon;
revoke all on function public.accept_team_invitation(text,text) from public,anon;
grant execute on function public.create_team_invitation(text,text) to authenticated;
grant execute on function public.accept_team_invitation(text,text) to authenticated;
