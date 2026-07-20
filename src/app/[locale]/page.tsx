import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/PostCard";
import Desclasificar from "@/components/Desclasificar";
import { CATEGORIES, categoryName } from "@/lib/categories";
import { pick, type Locale, type Post } from "@/lib/types";

const ALARM = new Set(["derechos-humanos", "injusticia"]);

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { cat } = await searchParams;
  const t = await getTranslations();

  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(display_name)")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (cat) query = query.eq("category_slug", cat);
  const { data } = await query;
  const posts = (data ?? []) as Post[];

  const featured = !cat ? posts[0] : undefined;
  const rest = featured ? posts.slice(1) : posts;

  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* Masthead */}
      <section className="border-b border-border py-14 sm:py-20">
        <div className="meta mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted/70">
          <span>№ 001</span>
          <span>·</span>
          <span>Archivo comunitario</span>
          <span>·</span>
          <span>Revisado por moderación</span>
        </div>
        <h1 className="max-w-4xl font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
          {t("site.name")}
        </h1>
        <p className="mt-6 max-w-2xl font-serif text-lg text-muted sm:text-xl">
          {t("home.heroLead")}
        </p>
      </section>

      {/* Nav de secciones (orden: humano primero) */}
      <nav className="flex flex-wrap gap-2 border-b border-border py-6">
        <Link
          href="/"
          className={`meta rounded-[2px] border px-3.5 py-1.5 transition-colors ${
            !cat ? "border-text bg-text text-bg" : "border-border text-muted hover:text-text"
          }`}
        >
          {t("home.all")}
        </Link>
        {CATEGORIES.map((c) => {
          const active = cat === c.slug;
          return (
            <Link
              key={c.slug}
              href={`/?cat=${c.slug}`}
              className={`meta rounded-[2px] border px-3.5 py-1.5 transition-colors ${
                active
                  ? "border-seal-bright text-seal-bright"
                  : "border-border text-muted hover:text-text"
              }`}
            >
              {categoryName(c.slug, locale)}
            </Link>
          );
        })}
      </nav>

      {posts.length === 0 ? (
        <p className="meta py-24 text-center text-muted">{t("home.empty")}</p>
      ) : (
        <div className="py-8">
          {/* Pieza destacada tipo dossier */}
          {featured && (
            <article className="paper perf mb-8 grid overflow-hidden md:grid-cols-2">
              {featured.cover_image_url && (
                <Link
                  href={`/post/${featured.slug}`}
                  className={`duo relative min-h-64 ${ALARM.has(featured.category_slug) ? "alarm" : ""}`}
                  style={{ viewTransitionName: `cover-${featured.slug}` }}
                >
                  <Image
                    src={featured.cover_image_url}
                    alt={pick(featured, "title", locale)}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </Link>
              )}
              <div className="flex flex-col justify-center gap-4 p-7 sm:p-10">
                <span className="stamp self-start">Pieza destacada · Revisado</span>
                <span className="kicker">[ {categoryName(featured.category_slug, locale)} ]</span>
                <h2 className="font-display text-4xl font-bold leading-[1.02] text-ink sm:text-5xl">
                  {ALARM.has(featured.category_slug) ? (
                    <Desclasificar text={pick(featured, "title", locale)} />
                  ) : (
                    pick(featured, "title", locale)
                  )}
                </h2>
                {pick(featured, "excerpt", locale) && (
                  <p className="font-serif text-lg text-ink-muted">
                    {pick(featured, "excerpt", locale)}
                  </p>
                )}
                <div className="meta mt-1 flex items-center gap-3 text-ink-muted">
                  {featured.profiles?.display_name && <span>— {featured.profiles.display_name}</span>}
                  <Link href={`/post/${featured.slug}`} className="text-seal underline decoration-1 underline-offset-4">
                    {t("home.readMore")} →
                  </Link>
                </div>
              </div>
            </article>
          )}

          {/* Sumario / índice del expediente */}
          {rest.length > 0 && (
            <>
              <div className="meta mb-4 mt-10 flex items-center gap-3 text-muted/70">
                <span>{t("home.latest")}</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <PostCard key={post.id} post={post} locale={locale} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
