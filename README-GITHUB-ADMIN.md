# SERA — GitHub Pages + Admin Dashboard

This version keeps the public storefront on GitHub Pages and uses Supabase for the private admin/data layer.

## Files
- `index.html` — public storefront
- `admin/index.html` — admin login/dashboard
- `supabase-config.js` — Supabase URL + anon key
- `supabase-schema.sql` — database tables + RLS policies

## Setup
1. Create a Supabase project.
2. In Supabase SQL Editor, run `supabase-schema.sql`.
3. Create your admin user in Supabase Authentication > Users.
4. Put the project URL and anon/public key in `supabase-config.js`.
5. Upload the whole folder to one GitHub repository.
6. Enable GitHub Pages from Settings > Pages > Deploy from branch / root.
7. Public page: `/`
8. Admin page: `/admin/`

Do not put a Supabase service_role key in the website. Use only the anon/public key.
