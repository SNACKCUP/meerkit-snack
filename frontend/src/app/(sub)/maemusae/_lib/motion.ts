"use client";

import gsap from "gsap";
import { useEffect, type RefObject } from "react";

// 화면이 열릴 때 [data-rise] 요소가 차례로 떠오른다. 움직임 끄기와 "동작 줄이기"에서는 가만히 둔다.
export function useRise(ref: RefObject<HTMLElement | null>, key?: unknown) {
  useEffect(() => {
    const scope = ref.current;
    if (!scope) return;
    if (document.documentElement.dataset.mkMotion === "off" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-rise]", { y: 22, opacity: 0, duration: 0.7, stagger: 0.07, ease: "power3.out", clearProps: "transform,opacity" });
    }, scope);
    return () => ctx.revert();
  }, [ref, key]);
}
