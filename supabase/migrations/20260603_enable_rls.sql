-- Enable Row Level Security for public tables exposed through Supabase.
-- Server-side Next.js routes should use SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.

create table if not exists public.homepage_text (
    id serial primary key,
    content text not null
);

insert into public.homepage_text (id, content)
values (
    1,
    'Exploratory programming where nature meets culture, for the outdoor community and beyond. Based in New York, streaming earth-wide.

Music from the underground. Talk, education, documentary, experimental, archival from the field.'
)
on conflict (id) do nothing;

alter table if exists public.episodes enable row level security;
alter table if exists public.hosts enable row level security;
alter table if exists public.tags enable row level security;
alter table if exists public.episode_hosts enable row level security;
alter table if exists public.episode_tags enable row level security;
alter table if exists public.episode_highlights enable row level security;
alter table if exists public.coming_up_text enable row level security;
alter table if exists public.about_text enable row level security;
alter table if exists public.homepage_text enable row level security;
alter table if exists public.schedule_image enable row level security;
alter table if exists public.admin_logs enable row level security;

do $$
begin
  if to_regclass('public.episodes') is not null then
    drop policy if exists "anon_public_read_published_episodes" on public.episodes;
    create policy "anon_public_read_published_episodes"
    on public.episodes
    for select
    to anon, authenticated
    using (
      status = 'published'
      and test_type in ('none', 'manual')
    );
  end if;

  if to_regclass('public.episode_hosts') is not null then
    drop policy if exists "anon_public_read_episode_hosts" on public.episode_hosts;
    create policy "anon_public_read_episode_hosts"
    on public.episode_hosts
    for select
    to anon, authenticated
    using (
      exists (
        select 1
        from public.episodes
        where episodes.id = episode_hosts.episode_id
          and episodes.status = 'published'
          and episodes.test_type in ('none', 'manual')
      )
    );
  end if;

  if to_regclass('public.episode_tags') is not null then
    drop policy if exists "anon_public_read_episode_tags" on public.episode_tags;
    create policy "anon_public_read_episode_tags"
    on public.episode_tags
    for select
    to anon, authenticated
    using (
      exists (
        select 1
        from public.episodes
        where episodes.id = episode_tags.episode_id
          and episodes.status = 'published'
          and episodes.test_type in ('none', 'manual')
      )
    );
  end if;

  if to_regclass('public.hosts') is not null then
    drop policy if exists "anon_public_read_hosts_for_published_episodes" on public.hosts;
    create policy "anon_public_read_hosts_for_published_episodes"
    on public.hosts
    for select
    to anon, authenticated
    using (
      exists (
        select 1
        from public.episode_hosts
        join public.episodes on episodes.id = episode_hosts.episode_id
        where episode_hosts.host_id = hosts.id
          and episodes.status = 'published'
          and episodes.test_type in ('none', 'manual')
      )
    );
  end if;

  if to_regclass('public.tags') is not null then
    drop policy if exists "anon_public_read_tags" on public.tags;
    create policy "anon_public_read_tags"
    on public.tags
    for select
    to anon, authenticated
    using (true);
  end if;

  if to_regclass('public.episode_highlights') is not null then
    drop policy if exists "anon_public_read_highlights_for_published_episodes" on public.episode_highlights;
    create policy "anon_public_read_highlights_for_published_episodes"
    on public.episode_highlights
    for select
    to anon, authenticated
    using (
      exists (
        select 1
        from public.episodes
        where episodes.id = episode_highlights.episode_id
          and episodes.status = 'published'
          and episodes.test_type in ('none', 'manual')
      )
    );
  end if;

  if to_regclass('public.coming_up_text') is not null then
    drop policy if exists "anon_public_read_coming_up_text" on public.coming_up_text;
    create policy "anon_public_read_coming_up_text"
    on public.coming_up_text
    for select
    to anon, authenticated
    using (true);
  end if;

  if to_regclass('public.about_text') is not null then
    drop policy if exists "anon_public_read_about_text" on public.about_text;
    create policy "anon_public_read_about_text"
    on public.about_text
    for select
    to anon, authenticated
    using (true);
  end if;

  if to_regclass('public.homepage_text') is not null then
    drop policy if exists "anon_public_read_homepage_text" on public.homepage_text;
    create policy "anon_public_read_homepage_text"
    on public.homepage_text
    for select
    to anon, authenticated
    using (true);
  end if;

  if to_regclass('public.schedule_image') is not null then
    drop policy if exists "anon_public_read_schedule_image" on public.schedule_image;
    create policy "anon_public_read_schedule_image"
    on public.schedule_image
    for select
    to anon, authenticated
    using (true);
  end if;
end $$;

-- No anon/authenticated policies are created for admin_logs.
-- No insert/update/delete policies are created on any table.

do $$
begin
  if to_regprocedure('public.execute_raw_sql(text)') is not null then
    revoke all on function public.execute_raw_sql(text) from public;
    revoke all on function public.execute_raw_sql(text) from anon;
    revoke all on function public.execute_raw_sql(text) from authenticated;
    grant execute on function public.execute_raw_sql(text) to service_role;
    alter function public.execute_raw_sql(text) set search_path = public, pg_catalog;
  end if;
end $$;
