"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "post"}-${suffix}`;
}

// Detecta el tipo real de imagen por magic bytes (no por el content-type del cliente).
function detectImage(buf: Uint8Array): { ext: string; mime: string } | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)
    return { ext: "png", mime: "image/png" };
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)
    return { ext: "jpg", mime: "image/jpeg" };
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38)
    return { ext: "gif", mime: "image/gif" };
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  )
    return { ext: "webp", mime: "image/webp" };
  return null;
}

export async function submitPost(formData: FormData) {
  const locale = (formData.get("locale") as string) || "es";
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const titleEs = (formData.get("title_es") as string)?.trim() || null;
  const titleEn = (formData.get("title_en") as string)?.trim() || null;
  const category = formData.get("category_slug") as string;

  // Portada: archivo de imagen subido (gana) o URL pegada como alternativa.
  let cover = (formData.get("cover_image_url") as string)?.trim() || null;
  const img = formData.get("cover");
  if (img instanceof File && img.size > 0 && img.size <= 5_000_000) {
    const buf = new Uint8Array(await img.arrayBuffer());
    const kind = detectImage(buf);
    if (kind) {
      const path = `${user!.id}/${crypto.randomUUID()}.${kind.ext}`;
      const { error: upErr } = await supabase.storage
        .from("covers")
        .upload(path, buf, { contentType: kind.mime });
      if (!upErr) {
        cover = supabase.storage.from("covers").getPublicUrl(path).data.publicUrl;
      }
    }
  }

  const { error } = await supabase.from("posts").insert({
    author_id: user!.id,
    category_slug: category,
    slug: slugify(titleEs || titleEn || "post"),
    title_es: titleEs,
    title_en: titleEn,
    excerpt_es: (formData.get("excerpt_es") as string)?.trim() || null,
    excerpt_en: (formData.get("excerpt_en") as string)?.trim() || null,
    body_es: (formData.get("body_es") as string)?.trim() || null,
    body_en: (formData.get("body_en") as string)?.trim() || null,
    cover_image_url: cover,
    status: "pending",
  });

  if (error) {
    redirect(`/${locale}/submit?error=1`);
  }
  redirect(`/${locale}/submit?sent=1`);
}

export async function moderatePost(formData: FormData) {
  const locale = (formData.get("locale") as string) || "es";
  const postId = formData.get("post_id") as string;
  const decision = formData.get("decision") as string;
  const supabase = await createClient();

  const status = decision === "approve" ? "published" : "rejected";
  await supabase.from("posts").update({ status }).eq("id", postId);

  revalidatePath(`/${locale}/moderacion`);
  revalidatePath(`/${locale}`);
}

const ALLOWED_FIELD_TYPES = ["text", "textarea", "date", "email", "number", "tel"];

function fieldName(label: string, i: number): string {
  const base = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return base || `campo_${i + 1}`;
}

export async function createTemplate(formData: FormData) {
  const locale = (formData.get("locale") as string) || "es";
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  // Campos definidos por el aportante (JSON desde el builder cliente)
  let raw: unknown = [];
  try {
    raw = JSON.parse((formData.get("fields") as string) || "[]");
  } catch {
    redirect(`/${locale}/formatos/nuevo?error=1`);
  }
  const seen = new Set<string>();
  const fields = (Array.isArray(raw) ? raw : [])
    .slice(0, 100) // cota dura de campos
    .map((f, i) => {
      const label = String((f as { label?: string })?.label ?? "").trim().slice(0, 120);
      const type = String((f as { type?: string })?.type ?? "text");
      return {
        label,
        type: ALLOWED_FIELD_TYPES.includes(type) ? type : "text",
        required: Boolean((f as { required?: boolean })?.required),
        name: "",
        placeholder: String((f as { placeholder?: string })?.placeholder ?? "").slice(0, 120),
        _i: i,
      };
    })
    .filter((f) => f.label.length > 0)
    .map((f) => {
      let n = fieldName(f.label, f._i);
      while (seen.has(n)) n = `${n}_${f._i}`;
      seen.add(n);
      return { name: n, label: f.label, type: f.type, required: f.required, placeholder: f.placeholder };
    });

  if (fields.length === 0) redirect(`/${locale}/formatos/nuevo?error=1`);

  // PDF de referencia opcional
  let referencePath: string | null = null;
  const pdf = formData.get("pdf");
  if (pdf instanceof File && pdf.size > 0 && pdf.size <= 6_000_000) {
    // No confiar en pdf.type (lo declara el cliente): validar los magic bytes "%PDF-".
    const buf = new Uint8Array(await pdf.arrayBuffer());
    const isPdf =
      buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46 && buf[4] === 0x2d;
    if (isPdf) {
      const path = `${user!.id}/${crypto.randomUUID()}.pdf`; // carpeta = uid (política RLS)
      const { error: upErr } = await supabase.storage
        .from("template-files")
        .upload(path, buf, { contentType: "application/pdf" });
      if (!upErr) referencePath = path;
    }
  }

  const { error } = await supabase.from("templates").insert({
    author_id: user!.id,
    category_slug: formData.get("category_slug") as string,
    locale: (formData.get("template_locale") as string) === "en" ? "en" : "es",
    title: ((formData.get("title") as string) || "").trim().slice(0, 160),
    description: ((formData.get("description") as string) || "").trim() || null,
    disclaimer: ((formData.get("disclaimer") as string) || "").trim() || null,
    fields,
    reference_pdf_path: referencePath,
    status: "pending",
  });

  if (error) redirect(`/${locale}/formatos/nuevo?error=1`);
  redirect(`/${locale}/formatos/nuevo?sent=1`);
}

export async function moderateTemplate(formData: FormData) {
  const locale = (formData.get("locale") as string) || "es";
  const templateId = formData.get("template_id") as string;
  const decision = formData.get("decision") as string;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const status = decision === "approve" ? "approved" : "rejected";

  // Al rechazar, borra el PDF de referencia (no dejar huérfanos privados).
  if (status === "rejected") {
    const { data: tpl } = await supabase
      .from("templates")
      .select("reference_pdf_path")
      .eq("id", templateId)
      .single();
    if (tpl?.reference_pdf_path) {
      await createAdminClient().storage.from("template-files").remove([tpl.reference_pdf_path]);
    }
  }

  await supabase
    .from("templates")
    .update({ status, reviewed_by: user?.id ?? null, reviewed_at: new Date().toISOString() })
    .eq("id", templateId);

  revalidatePath(`/${locale}/moderacion`);
  revalidatePath(`/${locale}/formatos`);
}

export async function signOut(formData: FormData) {
  const locale = (formData.get("locale") as string) || "es";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}
