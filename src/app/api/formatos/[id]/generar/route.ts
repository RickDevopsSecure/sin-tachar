import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";
import type { Template } from "@/lib/types";

const MAX_BODY = 512_000; // 512 KB
const MAX_VALUE = 2000; // chars por campo
const MAX_PAGES = 25;

// pdf-lib usa StandardFonts (WinAnsi/Latin-1). Saneamos para no romper la
// codificación: solo saltos de línea, ASCII imprimible y Latin-1 alto (áéíóúñ…).
// Los caracteres de control (CR, C1) crasheaban drawText → se eliminan.
function safe(text: string): string {
  return (text || "")
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .split("")
    .filter((ch) => {
      if (ch === "\n") return true;
      const c = ch.charCodeAt(0);
      return (c >= 0x20 && c <= 0x7e) || (c >= 0xa0 && c <= 0xff);
    })
    .join("");
}

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "documento"
  );
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const len = Number(req.headers.get("content-length") || "0");
  if (len > MAX_BODY) return new Response("Payload too large", { status: 413 });

  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("templates")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .single();
  if (!data) return new Response("Not found", { status: 404 });
  const tpl = data as Template;

  const form = await req.formData();

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const mono = await doc.embedFont(StandardFonts.Courier);
  const seal = rgb(0.71, 0.208, 0.165);
  const ink = rgb(0.086, 0.075, 0.055);
  const gray = rgb(0.29, 0.27, 0.23);

  const W = 595.28;
  const H = 841.89;
  const M = 56;
  const maxW = W - M * 2;

  let page = doc.addPage([W, H]);
  let y = H - M;
  let stopped = false;

  const wrap = (text: string, f: PDFFont, size: number): string[] => {
    const out: string[] = [];
    for (const para of text.split("\n")) {
      let line = "";
      for (const w of para.split(/\s+/)) {
        // Palabra sola más ancha que la caja → partir por caracteres.
        if (f.widthOfTextAtSize(w, size) > maxW) {
          if (line) {
            out.push(line);
            line = "";
          }
          let chunk = "";
          for (const ch of w) {
            if (chunk && f.widthOfTextAtSize(chunk + ch, size) > maxW) {
              out.push(chunk);
              chunk = ch;
            } else {
              chunk += ch;
            }
          }
          line = chunk;
          continue;
        }
        const test = line ? `${line} ${w}` : w;
        if (line && f.widthOfTextAtSize(test, size) > maxW) {
          out.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      out.push(line);
    }
    return out;
  };

  const ensure = (needed: number) => {
    if (stopped) return;
    if (y - needed < M + 60) {
      if (doc.getPageCount() >= MAX_PAGES) {
        stopped = true;
        return;
      }
      page = doc.addPage([W, H]);
      y = H - M;
    }
  };
  const draw = (text: string, f: PDFFont, size: number, color = ink, gap = 4) => {
    for (const line of wrap(text, f, size)) {
      if (stopped) return;
      ensure(size + gap);
      if (stopped) return;
      page.drawText(line, { x: M, y, size, font: f, color });
      y -= size + gap;
    }
  };

  // Encabezado
  page.drawText("SIN TACHAR", { x: M, y, size: 10, font: mono, color: seal });
  const rt = "EXPEDIENTE / FORMATO";
  page.drawText(rt, { x: W - M - mono.widthOfTextAtSize(rt, 8), y, size: 8, font: mono, color: gray });
  y -= 12;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: ink });
  y -= 28;

  draw(safe(tpl.title), bold, 20, ink, 6);
  y -= 6;
  const fecha = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "long", year: "numeric" }).format(new Date());
  draw(safe(`Generado el ${fecha}`), mono, 9, gray, 6);
  y -= 14;

  for (const f of tpl.fields) {
    const value =
      safe(String(form.get(f.name) ?? ""))
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .slice(0, MAX_VALUE) || "—";
    draw(safe(f.label.toUpperCase()), mono, 9, seal, 4);
    draw(value, font, 12, ink, 4);
    y -= 10;
  }

  if (tpl.disclaimer && !stopped) {
    y -= 8;
    ensure(40);
    if (!stopped) {
      page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.5, color: rgb(0.6, 0.55, 0.48) });
      y -= 16;
      draw(safe(tpl.disclaimer), font, 9, gray, 3);
    }
  }

  page.drawText(safe("Generado en Sin Tachar · archivo comunitario · uso libre"), {
    x: M,
    y: M - 20,
    size: 8,
    font: mono,
    color: rgb(0.55, 0.5, 0.44),
  });

  await supabase.rpc("bump_template_use", { t_id: id }).then(
    () => {},
    () => {},
  );

  const bytes = await doc.save();
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slug(tpl.title)}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
