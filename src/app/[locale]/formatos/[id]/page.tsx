import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { signedTemplateUrl } from "@/lib/supabase/admin";
import { categoryName } from "@/lib/categories";
import type { Locale, Template } from "@/lib/types";

export default async function FillTemplatePage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const supabase = await createClient();
  const { data } = await supabase
    .from("templates")
    .select("*, profiles!templates_author_id_fkey(display_name)")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (!data) notFound();
  const tpl = data as Template;

  const referenceUrl = await signedTemplateUrl(tpl.reference_pdf_path);

  const input =
    "w-full rounded-[2px] border border-paper-shade bg-[rgba(255,255,255,0.45)] px-3.5 py-2.5 font-serif text-ink placeholder:text-ink-muted/40 focus:border-seal focus:outline-none";

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/formatos" className="meta text-muted transition-colors hover:text-text">
        {t("formatos.back")}
      </Link>

      <article className="paper perf mt-6 p-6 sm:p-10">
        <div className="flex items-center justify-between gap-3">
          <span className="kicker">[ {categoryName(tpl.category_slug, locale)} ]</span>
          <span className="stamp">Revisado por moderador</span>
        </div>
        <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink">
          {tpl.title}
        </h1>
        {tpl.description && <p className="mt-3 font-serif text-ink-muted">{tpl.description}</p>}

        {referenceUrl && (
          <a
            href={referenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="meta mt-4 inline-block text-seal underline underline-offset-4"
          >
            {t("formatos.reference")} →
          </a>
        )}

        {/* Form nativo → el route handler devuelve el PDF como descarga */}
        <form action={`/api/formatos/${tpl.id}/generar`} method="POST" className="mt-8 space-y-5">
          {tpl.fields.map((f) => (
            <div key={f.name}>
              <label className="meta mb-2 block text-ink-muted">
                {f.label} {f.required && <span className="text-seal">*</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea name={f.name} required={f.required} placeholder={f.placeholder} rows={4} className={input} />
              ) : (
                <input
                  name={f.name}
                  type={f.type === "text" ? "text" : f.type}
                  required={f.required}
                  placeholder={f.placeholder}
                  className={input}
                />
              )}
            </div>
          ))}

          {tpl.disclaimer && <p className="meta text-ink-muted/80">{tpl.disclaimer}</p>}

          <button
            type="submit"
            className="meta rounded-[2px] border border-ink bg-ink px-6 py-3 text-paper transition-opacity hover:opacity-85"
          >
            {t("formatos.generate")} ↓
          </button>
        </form>
      </article>
    </div>
  );
}
