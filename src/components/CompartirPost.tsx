"use client";

import { useState } from "react";

/**
 * Compartir un post: en móvil usa el share nativo con la imagen (permite
 * Instagram/Stories); en escritorio ofrece descargar la tarjeta y copiar el enlace.
 */
export default function CompartirPost({
  slug,
  locale,
  title,
}: {
  slug: string;
  locale: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);
  const imgUrl = `/api/share/${locale}/${slug}`;

  async function compartir() {
    const url = window.location.href;
    // Intentar compartir la IMAGEN (así aparece Instagram en el menú del celular)
    try {
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const file = new File([blob], `sin-tachar-${slug}.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title, text: title });
        return;
      }
    } catch {
      /* sigue al fallback */
    }
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* cancelado o no disponible */
      }
    }
    copiarEnlace();
  }

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const btn =
    "meta rounded-[2px] border border-ink/25 px-4 py-2 text-ink transition-colors hover:border-seal hover:text-seal";

  return (
    <div className="mt-12 border-t border-paper-shade pt-6">
      <span className="kicker">Compartir en Instagram</span>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          onClick={compartir}
          className="meta rounded-[2px] border border-ink bg-ink px-5 py-2 text-paper transition-opacity hover:opacity-85"
        >
          Compartir
        </button>
        <a href={imgUrl} download={`sin-tachar-${slug}.png`} className={btn}>
          Descargar imagen
        </a>
        <button onClick={copiarEnlace} className={btn}>
          {copied ? "¡Copiado!" : "Copiar enlace"}
        </button>
      </div>
      <p className="meta mt-3 text-ink-muted/70">
        En el celular, “Compartir” abre Instagram y Stories. En compu, descarga la tarjeta y súbela.
      </p>
    </div>
  );
}
