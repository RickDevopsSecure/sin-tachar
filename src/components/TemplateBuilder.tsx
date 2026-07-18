"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createTemplate } from "@/lib/actions";
import { CATEGORIES, categoryName } from "@/lib/categories";
import type { Locale } from "@/lib/types";

type Row = { label: string; type: string; required: boolean };

const TYPES: Record<string, { es: string; en: string }> = {
  text: { es: "Texto", en: "Text" },
  textarea: { es: "Párrafo", en: "Paragraph" },
  date: { es: "Fecha", en: "Date" },
  email: { es: "Correo", en: "Email" },
  number: { es: "Número", en: "Number" },
  tel: { es: "Teléfono", en: "Phone" },
};

export default function TemplateBuilder({ locale }: { locale: Locale }) {
  const t = useTranslations("formatos");
  const [rows, setRows] = useState<Row[]>([{ label: "", type: "text", required: true }]);

  const update = (i: number, patch: Partial<Row>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const add = () => setRows((r) => [...r, { label: "", type: "text", required: false }]);
  const remove = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));

  const field =
    "w-full rounded-[2px] border border-border bg-surface-2 px-3.5 py-2.5 font-serif text-text placeholder:text-muted/40 focus:border-seal-bright focus:outline-none";
  const label = "meta mb-2 block text-muted";

  return (
    <form action={createTemplate} className="mt-8 space-y-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="fields" value={JSON.stringify(rows.filter((r) => r.label.trim()))} />

      <div>
        <label className={label}>{t("fTitle")}</label>
        <input name="title" required className={field} />
      </div>

      <div>
        <label className={label}>{t("fDesc")}</label>
        <textarea name="description" rows={2} className={field} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={label}>{t("fCategory")}</label>
          <select name="category_slug" required className={field}>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {categoryName(c.slug, locale)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Idioma / Language</label>
          <select name="template_locale" defaultValue={locale} className={field}>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div>
        <label className={label}>{t("fDisclaimer")}</label>
        <input name="disclaimer" className={field} placeholder={t("disclaimerDefault")} />
      </div>

      <div>
        <label className={label}>{t("fPdf")}</label>
        <input
          name="pdf"
          type="file"
          accept="application/pdf"
          className="meta block w-full text-muted file:mr-3 file:rounded-[2px] file:border file:border-border file:bg-surface-2 file:px-3 file:py-2 file:text-muted"
        />
        <p className="meta mt-1 text-muted/60">{t("fPdfHint")}</p>
      </div>

      {/* Campos dinámicos */}
      <fieldset className="rounded-[2px] border border-border p-4">
        <legend className="meta px-2 text-seal">{t("fields")}</legend>
        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                value={row.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder={t("fieldLabel")}
                className={`${field} flex-1 min-w-[160px]`}
              />
              <select
                value={row.type}
                onChange={(e) => update(i, { type: e.target.value })}
                className={`${field} w-auto`}
              >
                {Object.entries(TYPES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {locale === "en" ? v.en : v.es}
                  </option>
                ))}
              </select>
              <label className="meta flex items-center gap-1.5 text-muted">
                <input
                  type="checkbox"
                  checked={row.required}
                  onChange={(e) => update(i, { required: e.target.checked })}
                  className="accent-[var(--seal)]"
                />
                {t("fieldRequired")}
              </label>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="meta text-muted transition-colors hover:text-seal-bright"
                >
                  {t("removeField")}
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={add}
          className="meta mt-4 text-seal transition-opacity hover:opacity-70"
        >
          {t("addField")}
        </button>
      </fieldset>

      <button
        type="submit"
        className="meta rounded-[2px] border border-seal-bright bg-seal-bright px-6 py-3 text-bg transition-opacity hover:opacity-90"
      >
        {t("send")}
      </button>
    </form>
  );
}
