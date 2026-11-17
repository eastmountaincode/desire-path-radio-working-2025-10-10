-- Optional title. Existing items keep all content and receive an empty title.
alter table public.merch_items
    add column if not exists title text not null default ''
    check (char_length(title) <= 200);
