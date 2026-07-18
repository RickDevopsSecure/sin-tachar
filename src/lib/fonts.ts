import localFont from "next/font/local";
import { Newsreader, Courier_Prime } from "next/font/google";

// Redaction — Titus Kaphar, Reginald Dwayne Betts, Jeremy Mickel, Forest Young.
// SIL Open Font License 1.1. Self-hosted (la voz display de la marca).
export const redaction = localFont({
  src: [
    { path: "../fonts/Redaction-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Redaction-Italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/Redaction-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-redaction",
  display: "swap",
});

// Newsreader — lectura editorial (óptica variable, itálicas).
export const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

// Courier Prime — el "expediente mecanografiado": meta, sellos, № de edición.
export const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-courier",
  display: "swap",
});
