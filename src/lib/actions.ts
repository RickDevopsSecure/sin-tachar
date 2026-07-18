"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
  const cover = (formData.get("cover_image_url") as string)?.trim() || null;

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

export async function signOut(formData: FormData) {
  const locale = (formData.get("locale") as string) || "es";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}
