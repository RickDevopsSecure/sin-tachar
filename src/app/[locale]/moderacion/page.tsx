import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { moderatePost } from "@/lib/actions";
import { categoryName } from "@/lib/categories";
import { pick, type Locale, type Post } from "@/lib/types";

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

  const { data } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(display_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  const posts = (data ?? []) as Post[];

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <span className="kicker">Control editorial</span>
      <div className="mt-3 flex items-baseline justify-between border-b border-border pb-5">
        <h1 className="font-display text-5xl font-bold tracking-tight text-text">
          {t("moderation.title")}
        </h1>
        <span className="meta text-muted">
          {posts.length} {t("moderation.pending")}
        </span>
      </div>

      {posts.length === 0 ? (
        <p className="meta py-24 text-center text-muted">{t("moderation.empty")}</p>
      ) : (
        <ul className="mt-8 space-y-5">
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
                  <button
                    type="submit"
                    className="meta rounded-[2px] border border-ink bg-ink px-4 py-2 text-paper transition-opacity hover:opacity-85"
                  >
                    {t("moderation.approve")}
                  </button>
                </form>
                <form action={moderatePost}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="post_id" value={post.id} />
                  <input type="hidden" name="decision" value="reject" />
                  <button
                    type="submit"
                    className="meta rounded-[2px] border border-ink-muted/40 px-4 py-2 text-ink-muted transition-colors hover:border-seal hover:text-seal"
                  >
                    {t("moderation.reject")}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
