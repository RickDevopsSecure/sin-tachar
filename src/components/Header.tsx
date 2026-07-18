import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions";
import LocaleSwitcher from "./LocaleSwitcher";

export default async function Header() {
  const t = await getTranslations();
  const locale = await getLocale();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  let name: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, display_name")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
    name = profile?.display_name ?? null;
  }
  const isStaff = role === "editor" || role === "admin";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" className="group flex items-baseline gap-2.5">
          <span className="font-display text-2xl font-bold leading-none tracking-tight text-text">
            {t("site.name")}
          </span>
          <span className="meta hidden text-muted sm:inline">
            {t("site.tagline")}
          </span>
        </Link>

        <nav className="flex items-center gap-5">
          {user && (
            <Link href="/submit" className="meta text-muted transition-colors hover:text-text">
              {t("nav.submit")}
            </Link>
          )}
          {isStaff && (
            <Link href="/moderacion" className="meta text-muted transition-colors hover:text-text">
              {t("nav.moderation")}
            </Link>
          )}

          {user ? (
            <form action={signOut} className="flex items-center gap-3">
              <input type="hidden" name="locale" value={locale} />
              <span className="meta hidden text-muted/70 md:inline">{name}</span>
              <button
                type="submit"
                className="meta text-muted transition-colors hover:text-seal-bright"
              >
                {t("nav.logout")}
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="meta rounded-[2px] border border-seal-bright px-3.5 py-1.5 text-seal-bright transition-colors hover:bg-seal-bright hover:text-bg"
            >
              {t("nav.login")}
            </Link>
          )}

          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
