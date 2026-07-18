import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { redaction, newsreader, courierPrime } from "@/lib/fonts";
import Header from "@/components/Header";
import "../globals.css";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: `${t("site.name")} — ${t("site.tagline")}`,
    description: t("home.heroLead"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations({ locale });

  return (
    <html
      lang={locale}
      className={`${redaction.variable} ${newsreader.variable} ${courierPrime.variable}`}
    >
      <body className="min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main>{children}</main>
          <footer className="mt-28 border-t border-border">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-12">
              <span className="font-display text-3xl font-bold tracking-tight text-text">
                {t("site.name")}
              </span>
              <span className="meta text-muted">{t("site.tagline")}</span>
              <span className="meta mt-4 text-muted/60">
                № 001 · Archivo comunitario · Contenido revisado por moderación
              </span>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
