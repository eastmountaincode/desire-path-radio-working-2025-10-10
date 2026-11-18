begin;

alter table public.merch_items
    add column if not exists gallery_image_urls text[] not null default '{}';

create table if not exists public.shop_settings (
    id integer primary key check (id = 1),
    intro text not null check (char_length(intro) <= 1000)
);

alter table public.shop_settings enable row level security;
revoke all on public.shop_settings from anon, authenticated;
grant select, insert, update on public.shop_settings to service_role;

commit;
