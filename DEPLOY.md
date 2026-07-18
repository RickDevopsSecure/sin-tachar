# Deploy — Sin Tachar (preview gratis: Vercel + Supabase Cloud)

Objetivo: un preview público en `https://sin-tachar.vercel.app` a costo $0, para que
el equipo lo vea antes de comprar dominio. Todo con capa gratuita.

Requisitos: cuentas gratis en **Supabase** y **Vercel** (GitHub ya está).

---

## 1) Base de datos — Supabase Cloud

1. Crea un proyecto en https://supabase.com (región cercana: `East US` o `South America`).
2. Copia de **Project Settings → API**:
   - `Project URL` → será `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Aplica el **esquema** (elige una):
   - **Más fácil (sin CLI):** abre `supabase/prod-schema.sql`, copia TODO, pégalo en
     **SQL Editor** del dashboard de Supabase y dale **Run**. Es un solo archivo que
     crea todo (tablas, RLS, buckets, categorías). No incluye el seed local.
   - **CLI (si prefieres):**
     ```bash
     supabase link --project-ref TU_PROJECT_REF
     supabase db push            # aplica supabase/migrations/*
     ```
4. **NO corras `supabase/seed.sql` en producción** — ese seed es solo para local
   (crea un usuario admin falso y posts demo). En prod:
   - Entra al sitio y haz login con tu correo (magic link).
   - Luego, en el **SQL Editor**, vuélvete admin:
     ```sql
     update public.profiles set role = 'admin'
     where id = (select id from auth.users where email = 'TU_CORREO');
     ```
5. El bucket de imágenes `covers` se crea solo con la migración.

## 2) App — Vercel

1. En https://vercel.com → **Add New → Project** → importa el repo `sin-tachar`.
2. Framework: **Next.js** (autodetectado). No cambies el build command.
3. **Environment Variables** (de `.env.example`, con los valores de Supabase Cloud):
   | Variable | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://TU-PROYECTO.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | tu anon key (pública) |
   | `SUPABASE_SERVICE_ROLE_KEY` | tu service-role key (**secreta, solo servidor** — para URLs firmadas de PDFs y borrado en moderación) |
   | `NEXT_PUBLIC_SITE_URL` | `https://sin-tachar.vercel.app` |
4. **Deploy**. Te da la URL `https://sin-tachar.vercel.app`.

## 3) Auth — apuntar el magic link al dominio de Vercel

En Supabase → **Authentication → URL Configuration**:
- **Site URL:** `https://sin-tachar.vercel.app`
- **Redirect URLs:** agrega `https://sin-tachar.vercel.app/**`

Sin esto, el enlace mágico redirige mal y el login falla.

## 4) Correo (magic link) — nota importante

El correo integrado de Supabase (free) tiene **límites bajos** y puede caer en spam.
Alcanza para que unas pocas personas prueben. Para uso real, configura SMTP propio
(p. ej. **Resend**, capa gratis) en Authentication → Emails → SMTP.

---

## Notas
- **Auto-deploy:** cada `git push` a `main` redeploya solo en Vercel.
- **Supabase free** pausa el proyecto tras ~7 días sin actividad; se reanuda con un clic.
- Antes de producción real: incluir el texto completo de la licencia OFL de la fuente
  Redaction (ver `src/fonts/README.md`) y considerar SMTP propio.
