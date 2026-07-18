import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

// Next 16 renombró `middleware` → `proxy` (corre en runtime nodejs).
export async function proxy(request: NextRequest) {
  const response = intlMiddleware(request);
  return await updateSession(request, response);
}

export const config = {
  // Todo salvo assets estáticos, api y la ruta de callback de auth.
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
