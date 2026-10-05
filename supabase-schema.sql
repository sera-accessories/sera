-- SERA database setup for Supabase
create table if not exists public.site_settings (
  key text primary key,
  value text not null default ''
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  price numeric default 0,
  image_url text,
  sold_out boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.products enable row level security;

-- Public customers can read only public store data.
drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings for select using (true);

drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select using (active = true);

-- Admin writes: authenticated users only. For a single-owner store, create only your own Auth user.
drop policy if exists "authenticated manage settings" on public.site_settings;
create policy "authenticated manage settings" on public.site_settings for all to authenticated using (true) with check (true);

drop policy if exists "authenticated manage products" on public.products;
create policy "authenticated manage products" on public.products for all to authenticated using (true) with check (true);

insert into public.site_settings(key,value) values
('whatsapp','01044238420'),
('instagram','sera_store_1'),
('tagline','إكسسوارات بتكمّل إطلالتك'),
('heroText','قطع رقيقة بتفاصيل ذهبية دافئة، مصممة لترافق يومك وتضيف لمسة SERA.'),
('banner','الطلب بيتم عن طريق واتساب، اختاري قطعتك وابعتي الطلب')
on conflict (key) do nothing;

insert into public.products(name,category,price,image_url,sold_out,active)
select * from (values
('حلق دائري ذهبي','حلق',150,'',false,true),
('حلق لؤلؤ كلاسيك','حلق',180,'',false,true),
('سلسلة رفيعة بقلب','سلاسل',220,'',false,true),
('سلسلة حرف اسمك','سلاسل',260,'',false,true),
('أسورة ناعمة','أساور',190,'',false,true),
('طقم أساور ٣ قطع','أساور',300,'',false,true)
) as v(name,category,price,image_url,sold_out,active)
where not exists (select 1 from public.products);
