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
