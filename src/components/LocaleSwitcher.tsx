"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  function switchTo(next: "es" | "en") {
    if (next === locale) return;
    // @ts-expect-error -- params son dinámicos según la ruta actual
    router.replace({ pathname, params }, { locale: next });
  }

  return (
    <div className="flex items-center gap-1 text-xs font-medium tracking-wide">
      {(["es", "en"] as const).map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted/40">/</span>}
          <button
            onClick={() => switchTo(l)}
            className={
              l === locale
                ? "text-fg uppercase"
                : "text-muted hover:text-fg uppercase transition-colors"
            }
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
