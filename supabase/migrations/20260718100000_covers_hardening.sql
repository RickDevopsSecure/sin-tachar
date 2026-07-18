-- Endurece el bucket de portadas 'covers': solo imágenes, ≤5MB, subida a la
-- carpeta propia del usuario (mismo patrón que 'template-files').
update storage.buckets
  set file_size_limit = 5000000,
      allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
  where id = 'covers';

drop policy if exists "covers authenticated upload" on storage.objects;
create policy "covers upload own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text);
