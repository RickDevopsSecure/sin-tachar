import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import TemplateBuilder from "@/components/TemplateBuilder";
import type { Locale } from "@/lib/types";

export default async function NuevoFormatoPage({
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
        <p className="text-lg text-muted">{t("formatos.mustLogin")}</p>
        <Link
          href="/login"
          className="meta mt-6 inline-block rounded-[2px] border border-seal-bright bg-seal-bright px-5 py-2.5 text-bg"
        >
          {t("nav.login")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <Link href="/formatos" className="meta text-muted transition-colors hover:text-text">
        {t("formatos.back")}
      </Link>
      <h1 className="mt-6 font-display text-5xl font-bold tracking-tight text-text">
        {t("formatos.builderTitle")}
      </h1>
      <p className="mt-3 text-muted">{t("formatos.builderIntro")}</p>

      {sent && (
        <div className="paper mt-6 p-5">
          <span className="stamp">Recibido · En revisión</span>
          <p className="mt-3 font-serif text-ink">
            {t("formatos.success")}{" "}
            <Link href="/formatos" className="text-seal underline underline-offset-4">
              {t("formatos.back")}
            </Link>
          </p>
        </div>
      )}
      {error && (
        <p className="meta mt-6 rounded-[2px] border border-seal-bright/50 bg-seal-bright/10 px-4 py-3 text-seal-bright">
          {t("formatos.needField")}
        </p>
      )}

      <TemplateBuilder locale={locale} />
    </div>
  );
}
