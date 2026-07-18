export type PostStatus = "draft" | "pending" | "published" | "rejected";

export interface Post {
  id: string;
  author_id: string;
  category_slug: string;
  slug: string;
  title_es: string | null;
  title_en: string | null;
  excerpt_es: string | null;
  excerpt_en: string | null;
  body_es: string | null;
  body_en: string | null;
  cover_image_url: string | null;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { display_name: string | null } | null;
}

export type Locale = "es" | "en";

/** Devuelve el campo del idioma pedido, con fallback al otro. */
export function pick(
  post: Post,
  field: "title" | "excerpt" | "body",
  locale: Locale,
): string {
  const primary = locale === "en" ? post[`${field}_en`] : post[`${field}_es`];
  const fallback = locale === "en" ? post[`${field}_es`] : post[`${field}_en`];
  return (primary || fallback || "").toString();
}
