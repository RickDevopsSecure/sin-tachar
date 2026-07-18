-- ═══════════════════════════════════════════════════════════════════
-- Sin Tachar — SEED de PRODUCCIÓN (pega TODO en Supabase → SQL Editor → Run)
-- Crea contenido demo (posts + formatos) autorado por TU usuario admin,
-- y endurece el bucket de portadas. Seguro de correr una sola vez.
--
-- ⚠️ CAMBIA el email de abajo si te registraste con otro correo.
-- ═══════════════════════════════════════════════════════════════════

-- 1) Endurecer bucket 'covers' (solo imágenes, 5MB, subida a carpeta propia)
update storage.buckets
  set file_size_limit = 5000000,
      allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
  where id = 'covers';
drop policy if exists "covers authenticated upload" on storage.objects;
drop policy if exists "covers upload own folder" on storage.objects;
create policy "covers upload own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text);

-- 2) Contenido demo autorado por el admin real
do $$
declare admin_id uuid;
begin
  select id into admin_id from auth.users where email = 'ricardo.martinez@inbest.cloud';
  if admin_id is null then
    raise exception 'No encontré ese usuario. Regístrate primero en el sitio (magic link) o cambia el email en este script.';
  end if;

  insert into public.posts
    (author_id, category_slug, slug, title_es, title_en, excerpt_es, excerpt_en, body_es, body_en, cover_image_url, status, published_at)
  values
    (admin_id, 'derechos-humanos', 'defender-es-un-derecho',
     'Defender derechos también es un derecho', 'Defending rights is a right too',
     'Herramientas y formatos para quienes acompañan causas.', 'Tools and templates for those who accompany causes.',
     E'Documentar, denunciar y acompañar requiere herramientas. Aquí compartimos formatos listos para usar.\n\nLa defensa de derechos no debería depender de tener un abogado a la mano.',
     E'Documenting, reporting, and accompanying requires tools. Here we share ready-to-use templates.\n\nRights defense should not depend on having a lawyer on hand.',
     'https://picsum.photos/seed/resonar-derechos/1200/950', 'published', now() - interval '8 hour'),

    (admin_id, 'injusticia', 'lo-que-no-sale-en-las-noticias',
     'Lo que no sale en las noticias', 'What doesn''t make the news',
     'Historias que merecen visibilidad y no la tienen.', 'Stories that deserve visibility and don''t have it.',
     E'Este espacio existe para lo que el ciclo de noticias descarta.\n\nSi tienes una historia que debe compartirse, este es el lugar.',
     E'This space exists for what the news cycle discards.\n\nIf you have a story that must be shared, this is the place.',
     'https://picsum.photos/seed/resonar-injusticia/1200/1100', 'published', now() - interval '5 hour'),

    (admin_id, 'arte', 'arte-que-incomoda',
     'El arte que incomoda es el que importa', 'The art that unsettles is the art that matters',
     'Una selección de obras que no piden permiso.', 'A selection of works that ask no permission.',
     E'El arte cómodo decora. El arte incómodo interroga.\n\nEsta galería reúne piezas que se niegan a ser fondo de pantalla.',
     E'Comfortable art decorates. Uncomfortable art interrogates.\n\nThis gallery gathers pieces that refuse to be wallpaper.',
     'https://picsum.photos/seed/resonar-arte/1200/1500', 'published', now() - interval '2 day'),

    (admin_id, 'musica', 'sonidos-de-resistencia',
     'Sonidos de resistencia', 'Sounds of resistance',
     'Cómo la música ha sido crónica y trinchera a la vez.', 'How music has been both chronicle and trench.',
     E'Del son jarocho al punk: la música documenta lo que los archivos oficiales borran.\n\nUna lista de escucha con contexto.',
     E'From son jarocho to punk: music documents what official archives erase.\n\nA listening list with context.',
     'https://picsum.photos/seed/resonar-musica/1200/800', 'published', now() - interval '3 day'),

    (admin_id, 'ia-segura', 'que-significa-ia-segura',
     '¿Qué significa realmente "IA segura"?', 'What does "safe AI" really mean?',
     'Más allá del marketing: alineación, transparencia y quién carga con el riesgo.', 'Beyond the marketing: alignment, transparency, and who bears the risk.',
     E'La conversación sobre IA segura suele quedarse en abstracciones. Aquí bajamos a tierra.\n\nLa seguridad no se agrega al final: se diseña desde el principio o no existe.',
     E'The conversation about safe AI tends to stay abstract. Here we bring it down to earth.\n\nSafety is not bolted on at the end: it is designed from the start or it does not exist.',
     'https://picsum.photos/seed/resonar-ia/1200/900', 'published', now() - interval '1 day')
  on conflict (slug) do nothing;

  insert into public.templates
    (author_id, category_slug, locale, title, description, disclaimer, fields, status, reviewed_by, reviewed_at)
  values
    (admin_id, 'injusticia', 'es', 'Carta de queja laboral',
     'Documenta un despido o abuso laboral para presentarlo ante la autoridad.',
     'Este formato es orientativo y no sustituye asesoría jurídica profesional.',
     '[{"name":"nombre_completo","label":"Nombre completo","type":"text","required":true,"placeholder":"Tu nombre"},
       {"name":"empresa","label":"Empresa o empleador","type":"text","required":true,"placeholder":""},
       {"name":"fecha_incidente","label":"Fecha del incidente","type":"date","required":true,"placeholder":""},
       {"name":"descripcion","label":"Descripción de los hechos","type":"textarea","required":true,"placeholder":"Qué pasó, cuándo y quiénes"}]'::jsonb,
     'approved', admin_id, now()),

    (admin_id, 'derechos-humanos', 'es', 'Solicitud de acceso a la información',
     'Pide información pública a una dependencia de gobierno.',
     'Formato orientativo; verifica los requisitos de tu entidad.',
     '[{"name":"nombre_completo","label":"Nombre completo","type":"text","required":true,"placeholder":"Tu nombre"},
       {"name":"dependencia","label":"Dependencia a la que solicitas","type":"text","required":true,"placeholder":""},
       {"name":"informacion_solicitada","label":"Información que solicitas","type":"textarea","required":true,"placeholder":"Describe con claridad"}]'::jsonb,
     'approved', admin_id, now());
end $$;
