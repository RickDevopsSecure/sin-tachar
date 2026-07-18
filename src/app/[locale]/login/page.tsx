"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const t = useTranslations("login");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/${locale}`,
      },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <span className="kicker">Acceso · Sin contraseña</span>
      <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-text">
        {t("title")}
      </h1>
      <p className="mt-3 text-muted">{t("intro")}</p>

      {status === "sent" ? (
        <div className="paper mt-8 p-6">
          <span className="stamp">Enviado</span>
          <p className="mt-4 font-serif text-lg text-ink">{t("sent")}</p>
          <p className="meta mt-4 text-ink-muted">
            {t("devHint")}{" "}
            <a
              href="http://127.0.0.1:54324"
              target="_blank"
              rel="noopener noreferrer"
              className="text-seal underline underline-offset-4"
            >
              Mailpit →
            </a>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="meta mb-2 block text-muted">{t("email")}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full rounded-[2px] border border-border bg-surface-2 px-3.5 py-2.5 font-type text-sm text-text placeholder:text-muted/40 focus:border-seal-bright focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="meta w-full rounded-[2px] border border-seal-bright bg-seal-bright px-6 py-3 text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === "loading" ? "···" : t("send")}
          </button>
          {status === "error" && <p className="meta text-seal-bright">{t("error")}</p>}
        </form>
      )}
    </div>
  );
}
