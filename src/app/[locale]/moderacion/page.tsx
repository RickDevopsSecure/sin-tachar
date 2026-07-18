import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { signedTemplateUrl } from "@/lib/supabase/admin";
import { moderatePost, moderateTemplate } from "@/lib/actions";
import { categoryName } from "@/lib/categories";
import { pick, type Locale, type Post, type Template } from "@/lib/types";

export default async function ModerationPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/login", locale });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();
  const isStaff = profile?.role === "editor" || profile?.role === "admin";
  if (!isStaff) redirect({ href: "/", locale });

  const [{ data: postData }, { data: tplData }] = await Promise.all([
    supabase
      .from("posts")
      .select("*, profiles!posts_author_id_fkey(display_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase
      .from("templates")
      .select("*, profiles!templates_author_id_fkey(display_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
  ]);
  const posts = (postData ?? []) as Post[];
  const templates = (tplData ?? []) as Template[];
  const total = posts.length + templates.length;

  // URLs firmadas para que el moderador revise el PDF antes de aprobar.
  const tplUrls = new Map<string, string>();
  await Promise.all(
    templates
      .filter((tpl) => tpl.reference_pdf_path)
      .map(async (tpl) => {
        const u = await signedTemplateUrl(tpl.reference_pdf_path);
        if (u) tplUrls.set(tpl.id, u);
      }),
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <span className="kicker">Control editorial</span>
      <div className="mt-3 flex items-baseline justify-between border-b border-border pb-5">
        <h1 className="font-display text-5xl font-bold tracking-tight text-text">
          {t("moderation.title")}
        </h1>
        <span className="meta text-muted">
          {total} {t("moderation.pending")}
        </span>
      </div>

      {total === 0 && (
        <p className="meta py-24 text-center text-muted">{t("moderation.empty")}</p>
      )}

      {/* Historias */}
      {posts.length > 0 && (
        <>
          <div className="meta mb-4 mt-8 flex items-center gap-3 text-muted/70">
            <span>{t("moderation.posts")}</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <ul className="space-y-5">
            {posts.map((post) => (
              <li key={post.id} className="paper perf relative p-6">
                <span className="staple" aria-hidden="true" />
                <span className="kicker">[ {categoryName(post.category_slug, locale)} ]</span>
                <h3 className="mt-2 font-display text-2xl font-bold leading-snug text-ink">
                  {pick(post, "title", locale)}
                </h3>
                <p className="meta mt-1 text-ink-muted">— {post.profiles?.display_name}</p>
                <p className="mt-3 line-clamp-4 font-serif text-sm text-ink-muted">
                  {pick(post, "body", locale)}
                </p>
                <div className="mt-5 flex gap-3">
                  <form action={moderatePost}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="post_id" value={post.id} />
                    <input type="hidden" name="decision" value="approve" />
                    <button type="submit" className="meta rounded-[2px] border border-ink bg-ink px-4 py-2 text-paper transition-opacity hover:opacity-85">
                      {t("moderation.approve")}
                    </button>
                  </form>
                  <form action={moderatePost}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="post_id" value={post.id} />
                    <input type="hidden" name="decision" value="reject" />
                    <button type="submit" className="meta rounded-[2px] border border-ink-muted/40 px-4 py-2 text-ink-muted transition-colors hover:border-seal hover:text-seal">
                      {t("moderation.reject")}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Formatos */}
      {templates.length > 0 && (
        <>
          <div className="meta mb-4 mt-10 flex items-center gap-3 text-muted/70">
            <span>{t("moderation.templates")}</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <ul className="space-y-5">
            {templates.map((tpl) => (
              <li key={tpl.id} className="paper perf relative p-6">
                <span className="staple" aria-hidden="true" />
                <span className="kicker">[ {categoryName(tpl.category_slug, locale)} ]</span>
                <h3 className="mt-2 font-display text-2xl font-bold leading-snug text-ink">
                  {tpl.title}
                </h3>
                <p className="meta mt-1 text-ink-muted">
                  — {tpl.profiles?.display_name} · {tpl.fields.length} campos
                  {tplUrls.has(tpl.id) && (
                    <>
                      {" · "}
                      <a
                        href={tplUrls.get(tpl.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-seal underline underline-offset-2"
                      >
                        Revisar PDF adjunto →
                      </a>
                    </>
                  )}
                </p>
                {tpl.description && (
                  <p className="mt-3 font-serif text-sm text-ink-muted">{tpl.description}</p>
                )}
                <p className="meta mt-3 text-ink-muted/80">
                  {tpl.fields.map((f) => f.label).join(" · ")}
                </p>
                <div className="mt-5 flex gap-3">
                  <form action={moderateTemplate}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="template_id" value={tpl.id} />
                    <input type="hidden" name="decision" value="approve" />
                    <button type="submit" className="meta rounded-[2px] border border-ink bg-ink px-4 py-2 text-paper transition-opacity hover:opacity-85">
                      {t("moderation.approve")}
                    </button>
                  </form>
                  <form action={moderateTemplate}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="template_id" value={tpl.id} />
                    <input type="hidden" name="decision" value="reject" />
                    <button type="submit" className="meta rounded-[2px] border border-ink-muted/40 px-4 py-2 text-ink-muted transition-colors hover:border-seal hover:text-seal">
                      {t("moderation.reject")}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
