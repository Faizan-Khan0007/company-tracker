-- CareerPulse Database Schema for Supabase
-- Run this in your Supabase Project -> SQL Editor -> New Query

-- 1. Create Companies Table
create table if not exists public.companies (
  id text primary key,
  company text not null,
  role text,
  date text,
  priority text default 'high',
  applied text default 'applied',
  status text default 'Applied',
  oa text default '',
  interview text default '',
  contacted integer default 0,
  replies integer default 0,
  notes text default '',
  links text default '',
  pocs jsonb default '[]'::jsonb,
  resume_meta jsonb default null,
  resume_link text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.companies enable row level security;

-- 3. Allow public access with anon key (Simple personal tracker mode)
create policy "Allow all operations for anon users"
  on public.companies
  for all
  to anon
  using (true)
  with check (true);

-- 4. Create Storage Bucket for Resumes
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

-- 5. Storage Policies for Resumes
create policy "Public Access to Resumes"
  on storage.objects for select
  to anon
  using ( bucket_id = 'resumes' );

create policy "Allow Upload to Resumes"
  on storage.objects for insert
  to anon
  with check ( bucket_id = 'resumes' );

create policy "Allow Update to Resumes"
  on storage.objects for update
  to anon
  using ( bucket_id = 'resumes' );

create policy "Allow Delete from Resumes"
  on storage.objects for delete
  to anon
  using ( bucket_id = 'resumes' );
