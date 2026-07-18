import { createClient } from "@supabase/supabase-js";

// Cliente con service-role. SOLO servidor — nunca importar en componentes cliente.
// Se usa para URLs firmadas de PDFs (bucket privado) y borrado en moderación.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/** URL firmada temporal para un PDF de referencia (o null). */
export async function signedTemplateUrl(path: string | null, seconds = 600) {
  if (!path) return null;
  const admin = createAdminClient();
  const { data } = await admin.storage.from("template-files").createSignedUrl(path, seconds);
  return data?.signedUrl ?? null;
}
