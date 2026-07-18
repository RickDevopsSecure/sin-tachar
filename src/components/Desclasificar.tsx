"use client";

import { useEffect, useRef } from "react";

/**
 * Gesto firma: el titular nace tachado con una barra de tinta; el lector
 * arrastra (o usa flechas) para desclasificarlo. Sin JS o con reduced-motion
 * el texto queda legible (CSS base --reveal:1). Reservado a 1-2 piezas por vista.
 */
export default function Desclasificar({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    // Hay JS y se permite movimiento → nace tachado.
    el.style.setProperty("--reveal", "0");

    let dragging = false;
    const setFrom = (clientX: number) => {
      const r = el.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      el.style.setProperty("--reveal", p.toFixed(3));
    };
    const down = (e: PointerEvent) => {
      dragging = true;
      el.dataset.armed = "1";
      try {
        el.setPointerCapture(e.pointerId);
      } catch {}
      setFrom(e.clientX);
    };
    const move = (e: PointerEvent) => dragging && setFrom(e.clientX);
    const end = () => {
      dragging = false;
      delete el.dataset.armed;
    };
    const key = (e: KeyboardEvent) => {
      const cur = parseFloat(el.style.getPropertyValue("--reveal") || "0");
      if (e.key === "ArrowRight") {
        el.style.setProperty("--reveal", Math.min(1, cur + 0.12).toFixed(3));
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        el.style.setProperty("--reveal", Math.max(0, cur - 0.12).toFixed(3));
        e.preventDefault();
      } else if (e.key === "Enter" || e.key === " ") {
        el.style.setProperty("--reveal", "1");
        e.preventDefault();
      }
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("keydown", key);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
      el.removeEventListener("keydown", key);
    };
  }, [text]);

  return (
    <span
      ref={ref}
      className={`redact ${className}`}
      tabIndex={0}
      role="button"
      aria-label={`Desclasificar: ${text}`}
    >
      {text}
      <span className="redact-bar" aria-hidden="true" />
    </span>
  );
}
