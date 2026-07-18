import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { categoryName } from "@/lib/categories";
import { pick, type Locale, type Post } from "@/lib/types";

// Tarjeta 1080×1350 (formato retrato de Instagram) en la estética "expediente".
export async function GET(
  req: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params;
  const loc: Locale = locale === "en" ? "en" : "es";

  // Fuente servida desde /public y traída por HTTP (funciona en dev y en Vercel).
  // Instrument Serif: satori no soporta el GSUB de Redaction; esta es compatible.
  const origin = new URL(req.url).origin;
  const font = await fetch(`${origin}/fonts/InstrumentSerif-Regular.ttf`).then((r) =>
    r.arrayBuffer(),
  );

  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  const post = data as Post | null;
  const title = post ? pick(post, "title", loc) : "Sin Tachar";
  const kicker = post ? categoryName(post.category_slug, loc) : "Lo que debe compartirse";

  // Tamaño de título según longitud para que no desborde.
  const len = title.length;
  const titleSize = len > 72 ? 60 : len > 48 ? 74 : 92;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#e8e0ce",
          fontFamily: "Instrument Serif",
          color: "#16130e",
        }}
      >
        {/* Banda superior (cromo) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#0b0a0c",
            color: "#ece9e4",
            padding: "44px 60px",
          }}
        >
          <div style={{ display: "flex", fontSize: 48 }}>Sin Tachar</div>
          <div style={{ display: "flex", fontSize: 20, letterSpacing: 4, color: "#a7a0ad" }}>
            LO QUE DEBE COMPARTIRSE
          </div>
        </div>

        {/* Cuerpo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "72px 60px",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 28,
              letterSpacing: 6,
              color: "#b5352a",
              marginBottom: 34,
            }}
          >
            [ {kicker.toUpperCase()} ]
          </div>
          <div style={{ display: "flex", fontSize: titleSize, lineHeight: 1.06 }}>{title}</div>
        </div>

        {/* Pie */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "40px 60px",
            borderTop: "2px solid #d3c7ad",
          }}
        >
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 3, color: "#4a443a" }}>
            REVISADO · Nº 001
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#b5352a" }}>
            sin-tachar.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts: [{ name: "Instrument Serif", data: font, weight: 400, style: "normal" }],
    },
  );
}
