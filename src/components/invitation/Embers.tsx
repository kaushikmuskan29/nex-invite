"use client";
import React, { useEffect, useRef } from "react";

/** Gold embers drifting upward — drawn on a canvas behind the content. */
export default function Embers() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let w = (c.width = window.innerWidth);
    let h = (c.height = window.innerHeight);
    const onResize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    const n = w < 700 ? 28 : 60;
    const ps = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.8 + 0.5, vy: -(Math.random() * 0.5 + 0.2),
      ph: Math.random() * 6.28, hue: Math.random() > 0.3 ? "243,214,139" : "255,150,54",
    }));
    let raf = 0, t = 0;
    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.y += p.vy; p.x += Math.sin(t * 0.01 + p.ph) * 0.35;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        const a = 0.35 + Math.sin(t * 0.03 + p.ph) * 0.3;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.hue},${Math.max(0.05, a)})`;
        ctx.shadowBlur = 12; ctx.shadowColor = `rgba(${p.hue},.9)`;
        ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={ref} className="embers" aria-hidden="true" />;
}
