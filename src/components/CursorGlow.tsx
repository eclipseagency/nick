"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    // Only enable on non-touch devices
    const mq = window.matchMedia("(pointer: fine)");
    if (!mq.matches) {
      glow.style.display = "none";
      return;
    }

    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY + window.scrollY;
    };

    const lerp = () => {
      cx += (x - cx) * 0.08;
      cy += (y - cy) * 0.08;
      glow.style.transform = `translate(${cx - 300}px, ${cy - 300}px)`;
      raf = requestAnimationFrame(lerp);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(lerp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(246,190,0,0.06) 0%, rgba(246,190,0,0.02) 35%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
        willChange: "transform",
      }}
    />
  );
}
