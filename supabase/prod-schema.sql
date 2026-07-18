-- Sin Tachar — esquema de producción (pega TODO en Supabase → SQL Editor → Run).
-- Generado de supabase/migrations/*. NO incluye el seed local (usuario admin falso + demo).
-- Tras deploy: entra con tu correo (magic link) y hazte admin con el snippet de DEPLOY.md.

-- ============ 20260717000000_init.sql ============
-- Resonar — schema inicial
-- Blog comunitario con moderación, contenido bilingüe (ES/EN).

-- ─────────────────────────────────────────────────────────────
-- Tipos
-- ─────────────────────────────────────────────────────────────
create type public.user_role  as enum ('reader', 'author', 'editor', 'admin');
create type public.post_status as enum ('draft', 'pending', 'published', 'rejected');

-- ─────────────────────────────────────────────────────────────
-- Categorías
-- ─────────────────────────────────────────────────────────────
create table public.categories (
  slug       text primary key,
  name_es    text not null,
  name_en    text not null,
  sort_order int  not null default 0
);

-- Orden con lo humano primero; IA segura (no humanizado) al final.
insert into public.categories (slug, name_es, name_en, sort_order) values
  ('derechos-humanos', 'Derechos humanos',   'Human rights',   1),
  ('injusticia',       'Injusticia social',  'Social justice', 2),
  ('arte',             'Arte',               'Art',            3),
  ('musica',           'Música',             'Music',          4),
  ('ia-segura',        'IA segura',          'Safe AI',        5);

-- ─────────────────────────────────────────────────────────────
-- Perfiles (extiende auth.users)
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  bio          text,
  avatar_url   text,
  role         public.user_role not null default 'author',
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Posts (bilingües)
-- ─────────────────────────────────────────────────────────────
create table public.posts (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid not null references public.profiles (id) on delete cascade,
  category_slug   text not null references public.categories (slug),
  slug            text unique not null,
  title_es        text,
  title_en        text,
  excerpt_es      text,
  excerpt_en      text,
  body_es         text,
  body_en         text,
  cover_image_url text,
  status          public.post_status not null default 'pending',
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index posts_status_published_idx on public.posts (status, published_at desc);
create index posts_category_idx         on public.posts (category_slug);
create index posts_author_idx           on public.posts (author_id);

-- ─────────────────────────────────────────────────────────────
-- Comentarios y reacciones
-- ─────────────────────────────────────────────────────────────
create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);
create index comments_post_idx on public.comments (post_id, created_at);

create table public.reactions (
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  kind       text not null check (kind in ('like', 'save')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, kind)
);

-- ─────────────────────────────────────────────────────────────
-- Funciones / triggers
-- ─────────────────────────────────────────────────────────────

-- Crea perfil automáticamente al registrarse
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at automático
create function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ¿el usuario actual es staff (editor/admin)?
create function public.is_staff()
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('editor', 'admin')
  );
$$;

-- Solo un admin puede cambiar roles (evita auto-escalada de privilegios)
create function public.guard_profile_role()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.role is distinct from old.role
     and not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  then
    new.role := old.role;
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

-- Al publicar, sella published_at
create function public.stamp_published_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'published' and (old.status is distinct from 'published') then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger posts_stamp_published
  before update on public.posts
  for each row execute function public.stamp_published_at();

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────
alter table public.categories enable row level security;
alter table public.profiles   enable row level security;
alter table public.posts      enable row level security;
alter table public.comments   enable row level security;
alter table public.reactions  enable row level security;

-- Categorías: lectura pública
create policy "categories readable" on public.categories
  for select using (true);

-- Perfiles: lectura pública; cada quien edita el suyo
create policy "profiles readable" on public.profiles
  for select using (true);
create policy "update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Posts
create policy "read published posts" on public.posts
  for select using (status = 'published');
create policy "read own posts" on public.posts
  for select to authenticated using (auth.uid() = author_id);
create policy "staff read all posts" on public.posts
  for select to authenticated using (public.is_staff());

create policy "insert own post" on public.posts
  for insert to authenticated
  with check (auth.uid() = author_id and (status in ('draft', 'pending') or public.is_staff()));

create policy "author update own post" on public.posts
  for update to authenticated
  using  (auth.uid() = author_id and status in ('draft', 'pending', 'rejected'))
  with check (auth.uid() = author_id and status in ('draft', 'pending'));
create policy "staff update any post" on public.posts
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "author delete own post" on public.posts
  for delete to authenticated using (auth.uid() = author_id);
create policy "staff delete any post" on public.posts
  for delete to authenticated using (public.is_staff());

-- Comentarios (solo en posts publicados)
create policy "read comments on published" on public.comments
  for select using (
    exists (select 1 from public.posts p where p.id = post_id and p.status = 'published')
    or public.is_staff()
  );
create policy "insert own comment" on public.comments
  for insert to authenticated
  with check (
    auth.uid() = author_id
    and exists (select 1 from public.posts p where p.id = post_id and p.status = 'published')
  );
create policy "delete own comment" on public.comments
  for delete to authenticated using (auth.uid() = author_id or public.is_staff());

-- Reacciones
create policy "read reactions" on public.reactions
  for select using (true);
create policy "insert own reaction" on public.reactions
  for insert to authenticated with check (auth.uid() = user_id);
create policy "delete own reaction" on public.reactions
  for delete to authenticated using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- Storage: bucket público para portadas
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

create policy "covers public read" on storage.objects
  for select using (bucket_id = 'covers');
create policy "covers authenticated upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'covers');
create policy "covers owner update" on storage.objects
  for update to authenticated using (bucket_id = 'covers' and owner = auth.uid());
create policy "covers owner delete" on storage.objects
  for delete to authenticated using (bucket_id = 'covers' and owner = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- GRANTs a nivel tabla (RLS gobierna las filas; GRANT gobierna
-- el acceso a la tabla — se necesitan ambos).
-- ─────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on
  public.posts, public.comments, public.reactions, public.profiles
  to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- ============ 20260718000000_templates.sql ============
-- Formatos — plantillas de ayuda social/DDHH: se definen campos, se llenan y se
-- genera un PDF. Moderadas (sello de confianza). PDF de referencia opcional.

create type public.template_status as enum ('pending', 'approved', 'rejected');

create table public.templates (
  id                 uuid primary key default gen_random_uuid(),
  author_id          uuid not null references public.profiles (id) on delete cascade,
  category_slug      text not null references public.categories (slug),
  locale             text not null default 'es' check (locale in ('es', 'en')),
  title              text not null,
  description        text,
  disclaimer         text,
  -- [{ "name","label","type","required","placeholder" }]
  fields             jsonb not null default '[]'::jsonb,
  reference_pdf_path text,               -- bucket 'template-files' (opcional)
  status             public.template_status not null default 'pending',
  reviewed_by        uuid references public.profiles (id),
  reviewed_at        timestamptz,
  uses_count         int not null default 0,
  created_at         timestamptz not null default now()
);

create index templates_status_idx   on public.templates (status, created_at desc);
create index templates_category_idx on public.templates (category_slug);
create index templates_author_idx   on public.templates (author_id);

-- Contador de usos (cualquiera puede incrementar al generar)
create function public.bump_template_use(t_id uuid)
returns void language sql security definer set search_path = '' as $$
  update public.templates set uses_count = uses_count + 1 where id = t_id and status = 'approved';
$$;

-- ── RLS ──────────────────────────────────────────────────────
alter table public.templates enable row level security;

create policy "read approved templates" on public.templates
  for select using (status = 'approved');
create policy "read own templates" on public.templates
  for select to authenticated using (auth.uid() = author_id);
create policy "staff read all templates" on public.templates
  for select to authenticated using (public.is_staff());

create policy "insert own template" on public.templates
  for insert to authenticated
  with check (auth.uid() = author_id and (status = 'pending' or public.is_staff()));

create policy "author update own template" on public.templates
  for update to authenticated
  using (auth.uid() = author_id and status in ('pending', 'rejected'))
  with check (auth.uid() = author_id and status = 'pending');
create policy "staff update any template" on public.templates
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "author delete own template" on public.templates
  for delete to authenticated using (auth.uid() = author_id);
create policy "staff delete any template" on public.templates
  for delete to authenticated using (public.is_staff());

-- ── GRANTs ───────────────────────────────────────────────────
grant select on public.templates to anon, authenticated;
grant insert, update, delete on public.templates to authenticated;
grant execute on function public.bump_template_use(uuid) to anon, authenticated;

-- ── Storage: PDFs de referencia (bucket PRIVADO) ─────────────
-- Sin lectura pública: se sirven vía URL firmada server-side (service role),
-- solo para plantillas aprobadas o para el moderador. Límite 6MB, solo PDF.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('template-files', 'template-files', false, 6000000, array['application/pdf'])
on conflict (id) do nothing;

-- Cada usuario solo puede escribir bajo su propia carpeta (prefijo = su uid).
create policy "template-files upload own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'template-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "template-files owner delete" on storage.objects
  for delete to authenticated using (bucket_id = 'template-files' and owner = auth.uid());
