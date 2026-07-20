import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Transiciones de vista entre páginas (la portada "vuela" al artículo).
  experimental: {
    viewTransition: true,
  },
  images: {
    // El Supabase local sirve las portadas desde 127.0.0.1 (IP local).
    // Next 16 bloquea la optimización de IPs locales por defecto.
    dangerouslyAllowLocalIP: true,
    // Permitir SVG (solo servimos SVGs propios desde /public; covers de usuario
    // están restringidos a png/jpeg/webp/gif por el bucket).
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default withNextIntl(nextConfig);
