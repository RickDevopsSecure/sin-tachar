import type { Locale } from "@/i18n/routing";

// Orden con lo humano primero; IA segura (no humanizado) al final.
export const CATEGORIES = [
  { slug: "derechos-humanos", es: "Derechos humanos", en: "Human rights", varName: "--cat-derechos-humanos" },
  { slug: "injusticia", es: "Injusticia social", en: "Social justice", varName: "--cat-injusticia" },
  { slug: "arte", es: "Arte", en: "Art", varName: "--cat-arte" },
  { slug: "musica", es: "Música", en: "Music", varName: "--cat-musica" },
  { slug: "videojuegos", es: "Videojuegos", en: "Video games", varName: "--cat-videojuegos" },
  { slug: "ia-segura", es: "IA segura", en: "Safe AI", varName: "--cat-ia-segura" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function categoryName(slug: string, locale: Locale): string {
  const c = CATEGORIES.find((c) => c.slug === slug);
  if (!c) return slug;
  return locale === "en" ? c.en : c.es;
}

export function categoryColor(slug: string): string {
  const c = CATEGORIES.find((c) => c.slug === slug);
  return c ? `var(${c.varName})` : "var(--accent)";
}
