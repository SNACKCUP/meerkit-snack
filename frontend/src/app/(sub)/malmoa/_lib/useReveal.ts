"use client";

import gsap from "gsap";
import { useEffect, type RefObject } from "react";

// React가 하이드레이션을 끝낸 요소에만 손댄다 (끝나기 전에 속성·스타일을 바꾸면 하이드레이션 불일치가 난다).
// 하이드레이션된 DOM 노드에는 React가 __reactFiber 키를 붙인다.
const hydrated = (el: Element) => Object.keys(el).some((k) => k.startsWith("__reactFiber"));

// [data-rise] 요소가 화면에 들어오면 GSAP으로 부드럽게 올라오며 나타난다.
// 늦게 그려지는 요소(브라우저 데이터 화면)도 MutationObserver로 따라간다.
export function useReveal(root: RefObject<HTMLElement | null>, still: boolean) {
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const show = (el: Element) => el.setAttribute("data-in", "");
    const pending = () => [...host.querySelectorAll("[data-rise]:not([data-in])")].filter(hydrated);
    if (still) {
      let t: ReturnType<typeof setTimeout>;
      const tick = (n = 0) => {
        pending().forEach(show);
        if (n < 60) t = setTimeout(() => tick(n + 1), 100);
      };
      tick();
      const mo = new MutationObserver(() => pending().forEach(show));
      mo.observe(host, { childList: true, subtree: true });
      return () => {
        clearTimeout(t);
        mo.disconnect();
      };
    }
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
        hit.forEach((el, i) => {
          io.unobserve(el);
          gsap.fromTo(
            el,
            { opacity: 0, y: 32 },
            { opacity: 1, y: 0, duration: 1, delay: i * 0.09, ease: "power3.out", clearProps: "opacity,transform", onStart: () => show(el) },
          );
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const seen = new WeakSet<Element>();
    const watch = () =>
      pending().forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    // 하이드레이션이 늦게 끝나는 화면을 위해 잠깐 다시 확인한다
    let t: ReturnType<typeof setTimeout>;
    const tick = (n = 0) => {
      watch();
      if (n < 60) t = setTimeout(() => tick(n + 1), 100);
    };
    tick();
    const mo = new MutationObserver(watch);
    mo.observe(host, { childList: true, subtree: true });
    return () => {
      clearTimeout(t);
      mo.disconnect();
      io.disconnect();
    };
  }, [root, still]);
}
