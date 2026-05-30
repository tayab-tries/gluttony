create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'driver', 'owner', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.restaurants (
  id text primary key,
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  cuisine text not null,
  rating numeric(2,1) not null default 0,
  delivery_time text,
  delivery_fee numeric(10,2) default 0,
  image_url text,
  address text not null,
  location jsonb,
  is_open boolean not null default true,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id text primary key,
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text,
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,
  customer_email text,
  driver_email text,
  driver_name text,
  driver_location jsonb,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled')),
  restaurants text[] not null default '{}',
  restaurant_ids text[] not null default '{}',
  subtotal_price numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  service_fee numeric(10,2) not null default 0,
  total_price numeric(10,2) not null default 0,
  delivery_address text not null,
  customer_location jsonb,
  restaurant_locations jsonb not null default '[]'::jsonb,
  estimated_delivery text,
  distance_km numeric(10,2),
  route_stops integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id text,
  menu_item_name text not null,
  restaurant_id text,
  restaurant_name text,
  price numeric(10,2) not null,
  quantity integer not null default 1,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "profiles readable by authenticated users"
on public.profiles for select
to authenticated
using (true);

create policy "profiles insert self"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles update self"
on public.profiles for update
to authenticated
using (auth.uid() = id);

create policy "restaurants readable by anyone"
on public.restaurants for select
to anon, authenticated
using (true);

create policy "menu readable by anyone"
on public.menu_items for select
to anon, authenticated
using (true);

create policy "orders readable by related user"
on public.orders for select
to authenticated
using (
  customer_id = auth.uid()
  or exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role in ('driver', 'admin')
  )
);

create policy "order items readable by related user"
on public.order_items for select
to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
    and (
      orders.customer_id = auth.uid()
      or exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role in ('driver', 'admin')
      )
    )
  )
);
