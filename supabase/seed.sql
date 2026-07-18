-- Seed local — usuario admin + posts demo.
-- Solo para desarrollo local (se corre en `supabase db reset`).

-- Usuario admin (Ricardo). Login por magic link, sin password.
insert into auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  -- GoTrue (Go) no sabe escanear NULL en estas columnas de token:
  -- deben ir como cadena vacía o el login falla con "Database error finding user".
  confirmation_token, recovery_token, email_change,
  email_change_token_new, email_change_token_current
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated', 'ricardo.martinez@inbest.cloud',
  '', now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{}',
  '', '', '', '', ''
) on conflict (id) do nothing;

-- El trigger crea el profile; lo elevamos a admin y le ponemos nombre.
-- Desactivamos el guard de roles porque en el seed no hay auth.uid().
alter table public.profiles disable trigger profiles_guard_role;
update public.profiles
   set role = 'admin', display_name = 'Ricardo', bio = 'Editor fundador.'
 where id = '11111111-1111-1111-1111-111111111111';
alter table public.profiles enable trigger profiles_guard_role;

-- Posts demo (uno por categoría), ya publicados.
insert into public.posts
  (author_id, category_slug, slug, title_es, title_en, excerpt_es, excerpt_en, body_es, body_en, cover_image_url, status, published_at)
values
  ('11111111-1111-1111-1111-111111111111', 'ia-segura', 'que-significa-ia-segura',
   '¿Qué significa realmente "IA segura"?',
   'What does "safe AI" really mean?',
   'Más allá del marketing: alineación, transparencia y quién carga con el riesgo.',
   'Beyond the marketing: alignment, transparency, and who bears the risk.',
   E'La conversación sobre IA segura suele quedarse en abstracciones. Aquí bajamos a tierra: qué se puede auditar, qué no, y por qué la transparencia no es opcional.\n\nLa seguridad no es una propiedad que se agrega al final. Se diseña desde el principio o no existe.',
   E'The conversation about safe AI tends to stay abstract. Here we bring it down to earth: what can be audited, what can''t, and why transparency is not optional.\n\nSafety is not a property you bolt on at the end. It is designed from the start or it does not exist.',
   'https://picsum.photos/seed/resonar-ia/1200/900', 'published', now() - interval '1 day'),

  ('11111111-1111-1111-1111-111111111111', 'arte', 'arte-que-incomoda',
   'El arte que incomoda es el que importa',
   'The art that unsettles is the art that matters',
   'Una selección de obras que no piden permiso.',
   'A selection of works that ask no permission.',
   E'El arte cómodo decora. El arte incómodo interroga.\n\nEsta galería reúne piezas que se niegan a ser fondo de pantalla.',
   E'Comfortable art decorates. Uncomfortable art interrogates.\n\nThis gallery gathers pieces that refuse to be wallpaper.',
   'https://picsum.photos/seed/resonar-arte/1200/1500', 'published', now() - interval '2 day'),

  ('11111111-1111-1111-1111-111111111111', 'musica', 'sonidos-de-resistencia',
   'Sonidos de resistencia',
   'Sounds of resistance',
   'Cómo la música ha sido crónica y trinchera a la vez.',
   'How music has been both chronicle and trench.',
   E'Del son jarocho al punk, del corrido al rap: la música documenta lo que los archivos oficiales borran.\n\nUna lista de escucha con contexto.',
   E'From son jarocho to punk, from corrido to rap: music documents what official archives erase.\n\nA listening list with context.',
   'https://picsum.photos/seed/resonar-musica/1200/800', 'published', now() - interval '3 day'),

  ('11111111-1111-1111-1111-111111111111', 'injusticia', 'lo-que-no-sale-en-las-noticias',
   'Lo que no sale en las noticias',
   'What doesn''t make the news',
   'Historias que merecen visibilidad y no la tienen.',
   'Stories that deserve visibility and don''t have it.',
   E'Este espacio existe para lo que el ciclo de noticias descarta.\n\nSi tienes una historia que debe compartirse, este es el lugar.',
   E'This space exists for what the news cycle discards.\n\nIf you have a story that must be shared, this is the place.',
   'https://picsum.photos/seed/resonar-injusticia/1200/1100', 'published', now() - interval '5 hour'),

  ('11111111-1111-1111-1111-111111111111', 'derechos-humanos', 'defender-es-un-derecho',
   'Defender derechos también es un derecho',
   'Defending rights is a right too',
   'Herramientas y formatos para quienes acompañan causas.',
   'Tools and templates for those who accompany causes.',
   E'Documentar, denunciar y acompañar requiere herramientas. Aquí compartimos formatos listos para usar: cartas, quejas, solicitudes de información.\n\nLa defensa de derechos no debería depender de tener un abogado a la mano.',
   E'Documenting, reporting, and accompanying requires tools. Here we share ready-to-use templates: letters, complaints, information requests.\n\nRights defense should not depend on having a lawyer on hand.',
   'https://picsum.photos/seed/resonar-derechos/1200/950', 'published', now() - interval '8 hour');
