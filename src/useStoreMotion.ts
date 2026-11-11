import { useEffect } from "react";

const revealTargets = [
  ".section-heading > div",
  ".section-heading > .text-link",
  ".product-card",
  ".category-card",
  ".new-banner > :not(.banner-year)",
  ".story-image",
  ".story-copy > *",
  ".community > .eyebrow",
  ".community > h2",
  ".community > p",
  ".community-grid > div",
  ".newsletter > div",
  ".newsletter > form",
  ".collection-intro",
  ".gallery",
  ".product-details",
  ".checkout-title",
].join(", ");

export default function useStoreMotion(page: string) {
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) return;

    const targets = document.querySelectorAll<HTMLElement>(revealTargets);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });

    targets.forEach(element => {
      if (element.classList.contains("is-visible")) return;
      const siblings = Array.from(element.parentElement?.children || []);
      const staggered = element.matches(".product-card, .category-card, .community-grid > div");
      const section = element.closest("section");
      const sections = Array.from(document.querySelectorAll("main section"));
      const fromRight = element.matches(".section-heading > .text-link, .story-copy > *, .product-details, .newsletter > form") ||
        !element.matches(".story-image, .gallery") && (staggered ? siblings.indexOf(element) % 2 === 1 : section !== null && sections.indexOf(section) % 2 === 1);
      element.dataset.reveal = fromRight ? "right" : "left";
      const delay = staggered ? siblings.indexOf(element) % 4 * 90 : element.matches(".story-copy > *") ? siblings.indexOf(element) * 80 : 0;
      element.style.setProperty("--reveal-delay", `${delay}ms`);
      element.classList.add("scroll-reveal");
      observer.observe(element);
    });
    return () => observer.disconnect();
  });

  useEffect(() => {
    const root = document.documentElement;
    const hero = document.querySelector<HTMLElement>(".hero-image");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable = root.scrollHeight - window.innerHeight;
      root.style.setProperty("--scroll-progress", `${scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0}`);
      if (hero) {
        const offset = !reducedMotion.matches && window.innerWidth > 700
          ? Math.min(window.scrollY * 0.12, 65)
          : 0;
        hero.style.setProperty("--hero-drift", `${offset}px`);
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reducedMotion.addEventListener("change", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reducedMotion.removeEventListener("change", schedule);
      cancelAnimationFrame(frame);
    };
  }, [page]);
}
