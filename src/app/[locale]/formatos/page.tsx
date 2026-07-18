import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { categoryName } from "@/lib/categories";
import type { Locale, Template } from "@/lib/types";

export default async function FormatosPage({
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
  const { data } = await supabase
    .from("templates")
    .select("*, profiles!templates_author_id_fkey(display_name)")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  const templates = (data ?? []) as Template[];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="kicker">Herramientas · Uso libre</span>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-text sm:text-6xl">
            {t("formatos.libTitle")}
          </h1>
          <p className="mt-3 max-w-2xl text-muted">{t("formatos.libIntro")}</p>
        </div>
        {user && (
          <Link
            href="/formatos/nuevo"
            className="meta shrink-0 rounded-[2px] border border-seal-bright px-4 py-2 text-seal-bright transition-colors hover:bg-seal-bright hover:text-bg"
          >
            {t("formatos.new")}
          </Link>
        )}
      </div>

      {templates.length === 0 ? (
        <p className="meta py-24 text-center text-muted">{t("formatos.empty")}</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <Link key={tpl.id} href={`/formatos/${tpl.id}`} className="paper flex flex-col p-6 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="kicker">[ {categoryName(tpl.category_slug, locale)} ]</span>
                <span className="stamp text-[0.6rem]">Revisado</span>
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-ink">
                {tpl.title}
              </h2>
              {tpl.description && (
                <p className="mt-2 flex-1 font-serif text-[0.95rem] text-ink-muted">
                  {tpl.description}
                </p>
              )}
              <div className="meta mt-5 flex items-center justify-between text-ink-muted">
                <span>
                  {tpl.fields.length} campos · {tpl.uses_count} {t("formatos.uses")}
                </span>
                <span className="text-seal">{t("formatos.fill")} →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
