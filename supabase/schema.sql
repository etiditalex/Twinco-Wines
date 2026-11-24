-- TwinCO Wines desk. Run this once in the Supabase SQL editor.
-- Local testing uses the publishable key, which signs in as anon and must pass these policies.
-- A service role key, if you add one later, bypasses row level security.

create extension if not exists pgcrypto;

create table if not exists locations (
  id text primary key,
  name text not null,
  province text not null,
  fee_kes integer not null,
  eligible boolean not null default true,
  timing text not null default '',
  note text not null default '',
  sort integer not null default 0
);

create table if not exists products (
  slug text primary key,
  name text not null,
  producer text not null,
  country text not null,
  region text not null default '',
  grape text not null default '',
  style text,
  aisle text not null,
  category text not null,
  alcohol text not null default '',
  description text not null default '',
  tasting_note text not null default '',
  pairing text not null default '',
  image_url text not null default '',
  featured boolean not null default false,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists product_variants (
  id text primary key,
  product_slug text not null references products (slug) on delete cascade,
  size_ml integer not null,
  price_kes integer not null,
  stock integer not null default 0
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  status text not null check (status in ('pending', 'confirmed', 'declined')),
  customer_name text not null,
  phone text not null,
  email text not null,
  location_id text not null references locations (id),
  address text not null,
  notes text not null default '',
  payment_method text not null default 'M-Pesa',
  promotion text not null default 'None',
  age_confirmed boolean not null default false,
  handover_confirmed boolean not null default false,
  subtotal_kes integer not null,
  fee_kes integer not null,
  total_kes integer not null,
  source text not null default 'request',
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create table if not exists booking_lines (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id) on delete cascade,
  product_slug text not null,
  variant_id text not null,
  name text not null,
  category text not null,
  aisle text not null default 'wine',
  size_ml integer not null,
  quantity integer not null check (quantity > 0),
  unit_price_kes integer not null
);

create table if not exists desk_admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  role text not null check (role in ('super_admin', 'manager', 'admin')),
  password_hash text not null,
  active boolean not null default true,
  created_by text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists bookings_created_at_idx on bookings (created_at);
create index if not exists bookings_status_idx on bookings (status);
create index if not exists booking_lines_booking_idx on booking_lines (booking_id);
create index if not exists product_variants_product_idx on product_variants (product_slug);

alter table locations enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table bookings enable row level security;
alter table booking_lines enable row level security;
alter table desk_admins enable row level security;

-- Confirm only if every line still has stock. A failed line rolls the whole confirmation back.
create or replace function confirm_booking(booking uuid)
returns text
language plpgsql
as $$
declare
  line record;
  updated_count integer;
begin
  if not exists (select 1 from bookings where id = booking and status = 'pending') then
    return 'That request is no longer pending.';
  end if;

  for line in select * from booking_lines where booking_id = booking loop
    update product_variants
      set stock = stock - line.quantity
      where id = line.variant_id and stock >= line.quantity;
    get diagnostics updated_count = row_count;
    if updated_count <> 1 then
      raise exception '% is not available for this quantity.', line.name;
    end if;
  end loop;

  update bookings
    set status = 'confirmed', confirmed_at = now()
    where id = booking and status = 'pending';

  return 'ok';
end;
$$;

revoke all on function public.confirm_booking(uuid) from public;
grant execute on function public.confirm_booking(uuid) to anon, authenticated, service_role;

grant select, insert, update, delete on table public.locations to anon, authenticated;
grant select, insert, update, delete on table public.products to anon, authenticated;
grant select, insert, update, delete on table public.product_variants to anon, authenticated;
grant select, insert, update, delete on table public.bookings to anon, authenticated;
grant select, insert, update, delete on table public.booking_lines to anon, authenticated;
grant select, insert, update, delete on table public.desk_admins to anon, authenticated;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'desk manages locations') then
    create policy "desk manages locations" on public.locations for all to anon, authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'desk manages products') then
    create policy "desk manages products" on public.products for all to anon, authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'desk manages variants') then
    create policy "desk manages variants" on public.product_variants for all to anon, authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'desk manages bookings') then
    create policy "desk manages bookings" on public.bookings for all to anon, authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'desk manages booking lines') then
    create policy "desk manages booking lines" on public.booking_lines for all to anon, authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and policyname = 'desk manages admins') then
    create policy "desk manages admins" on public.desk_admins for all to anon, authenticated using (true) with check (true);
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'product images are public'
  ) then
    create policy "product images are public"
      on storage.objects
      for select
      to public
      using (bucket_id = 'product-images');
  end if;
  if not exists (
    select 1 from pg_policies where policyname = 'desk uploads product images'
  ) then
    create policy "desk uploads product images"
      on storage.objects
      for insert
      to anon, authenticated
      with check (bucket_id = 'product-images');
  end if;
end $$;
