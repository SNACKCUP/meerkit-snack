"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

import { useStill } from "../_lib/useStill";

// 포인터를 천천히 따라오는 빛. 히어로 배경에만 깐다. (움직임이 꺼져 있으면 가운데에 고정)
export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const still = useStill();
  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host || still) return;
    const ctx = gsap.context(() => {
      const x = gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" });
      const y = gsap.quickTo(el, "y", { duration: 1.2, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        x(e.clientX - r.left - r.width / 2);
        y(e.clientY - r.top - r.height / 2);
      };
      host.addEventListener("pointermove", move);
      return () => host.removeEventListener("pointermove", move);
    });
    return () => ctx.revert();
  }, [still]);
  return <div ref={ref} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--mk-sky)/12 blur-3xl" />;
}
