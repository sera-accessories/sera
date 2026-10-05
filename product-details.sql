-- شغّل الملف ده مرة واحدة في Supabase > SQL Editor
alter table public.products add column if not exists description text not null default '';
alter table public.products add column if not exists images text[] not null default '{}';

-- انقل الصور القديمة (لو فيه) للعمود الجديد
update public.products
set images = array[image_url]
where coalesce(image_url,'') <> '' and cardinality(images) = 0;
