import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { categoryName } from "@/lib/categories";
import { pick, type Locale, type Post } from "@/lib/types";

const ALARM = new Set(["derechos-humanos", "injusticia"]);

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(display_name)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!data) notFound();
  const post = data as Post;

  const title = pick(post, "title", locale);
  const body = pick(post, "body", locale);
  const paragraphs = body.split(/\n+/).filter(Boolean);
  const fecha = post.published_at
    ? new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(post.published_at))
    : "";

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/" className="meta text-muted transition-colors hover:text-text">
        {t("post.back")}
      </Link>

      <article className="paper perf mt-6 p-6 sm:p-12">
        <div className="flex items-center justify-between gap-3">
          <span className="kicker">[ {categoryName(post.category_slug, locale)} ]</span>
          <span className="stamp">Revisado por moderador</span>
        </div>

        <h1 className="mt-5 font-display text-4xl font-bold leading-[1.03] text-ink sm:text-6xl">
          {title}
        </h1>

        <div className="meta mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-muted">
          {post.profiles?.display_name && (
            <span>
              {t("post.by")} {post.profiles.display_name}
            </span>
          )}
          {fecha && <span>· {fecha}</span>}
        </div>

        {post.cover_image_url && (
          <div
            className={`duo relative mt-8 aspect-video w-full ${ALARM.has(post.category_slug) ? "alarm" : ""}`}
          >
            <Image
              src={post.cover_image_url}
              alt={title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <div className="prose-paper mt-9">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
