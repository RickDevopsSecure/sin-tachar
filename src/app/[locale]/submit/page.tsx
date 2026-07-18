import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { submitPost } from "@/lib/actions";
import { CATEGORIES, categoryName } from "@/lib/categories";
import type { Locale } from "@/lib/types";

export default async function SubmitPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { sent, error } = await searchParams;
  const t = await getTranslations();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <p className="text-lg text-muted">{t("submit.mustLogin")}</p>
        <Link
          href="/login"
          className="meta mt-6 inline-block rounded-[2px] border border-seal-bright bg-seal-bright px-5 py-2.5 text-bg"
        >
          {t("nav.login")}
        </Link>
      </div>
    );
  }

  const field =
    "w-full rounded-[2px] border border-border bg-surface-2 px-3.5 py-2.5 font-serif text-text placeholder:text-muted/40 focus:border-seal-bright focus:outline-none";
  const label = "meta mb-2 block text-muted";

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <span className="kicker">Nueva contribución · Pasa por revisión</span>
      <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-text">
        {t("submit.title")}
      </h1>
      <p className="mt-3 text-muted">{t("submit.intro")}</p>

      {sent && (
        <div className="paper mt-6 p-5">
          <span className="stamp">Recibido · En revisión</span>
          <p className="mt-3 font-serif text-ink">
            {t("submit.success")}{" "}
            <Link href="/submit" className="text-seal underline underline-offset-4">
              {t("submit.sendAnother")}
            </Link>
          </p>
        </div>
      )}
      {error && (
        <p className="meta mt-6 rounded-[2px] border border-seal-bright/50 bg-seal-bright/10 px-4 py-3 text-seal-bright">
          {t("login.error")}
        </p>
      )}

      <form action={submitPost} className="mt-8 space-y-6">
        <input type="hidden" name="locale" value={locale} />

        <div>
          <label className={label}>{t("submit.category")}</label>
          <select name="category_slug" required className={field}>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {categoryName(c.slug, locale)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label}>
            {t("submit.coverUrl")} <span className="text-muted/50">· {t("submit.optional")}</span>
          </label>
          <input name="cover_image_url" type="url" placeholder="https://…" className={field} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className={label}>{t("submit.titleEs")}</label>
            <input name="title_es" className={field} />
          </div>
          <div>
            <label className={label}>{t("submit.titleEn")}</label>
            <input name="title_en" className={field} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className={label}>{t("submit.excerptEs")}</label>
            <textarea name="excerpt_es" rows={2} className={field} />
          </div>
          <div>
            <label className={label}>{t("submit.excerptEn")}</label>
            <textarea name="excerpt_en" rows={2} className={field} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className={label}>{t("submit.bodyEs")}</label>
            <textarea name="body_es" rows={8} className={field} />
          </div>
          <div>
            <label className={label}>{t("submit.bodyEn")}</label>
            <textarea name="body_en" rows={8} className={field} />
          </div>
        </div>

        <button
          type="submit"
          className="meta rounded-[2px] border border-seal-bright bg-seal-bright px-6 py-3 text-bg transition-opacity hover:opacity-90"
        >
          {t("submit.send")}
        </button>
      </form>
    </div>
  );
}
