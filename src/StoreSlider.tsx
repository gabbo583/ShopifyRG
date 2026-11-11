import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  label: string;
  variant?: "products" | "categories" | "hero";
  autoplay?: boolean;
};

function Arrow({ previous = false }: { previous?: boolean }) {
  return <svg className={previous ? "slider-arrow previous" : "slider-arrow"} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>;
}

export default function StoreSlider({ children, label, variant = "products", autoplay = false }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, start: 0, scroll: 0 });
  const [position, setPosition] = useState({ index: 0, total: 1, start: true, end: false, progress: 0 });
  const [playing, setPlaying] = useState(autoplay);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setReduced(media.matches); if (media.matches) setPlaying(false); };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = element.scrollWidth - element.clientWidth;
      const cards = Array.from(element.children) as HTMLElement[];
      const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : element.clientWidth;
      setPosition({
        index: Math.min(cards.length - 1, Math.round(element.scrollLeft / Math.max(1, step))),
        total: cards.length,
        start: element.scrollLeft < 4,
        end: max - element.scrollLeft < 4,
        progress: max > 0 ? element.scrollLeft / max : 0,
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = new ResizeObserver(schedule);
    resize.observe(element);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(element);
    element.addEventListener("scroll", schedule, { passive: true });
    update();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); element.removeEventListener("scroll", schedule); };
  }, [children]);

  function move(direction: number, wrap = false) {
    const element = track.current;
    if (!element) return;
    const cards = Array.from(element.children) as HTMLElement[];
    const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : element.clientWidth;
    const max = element.scrollWidth - element.clientWidth;
    const next = wrap && element.scrollLeft >= max - 4 ? 0 : Math.min(max, Math.max(0, element.scrollLeft + direction * step));
    element.scrollTo({ left: next, behavior: reduced ? "instant" : "smooth" });
  }

  function goTo(index: number) {
    const element = track.current;
    const card = element?.children[index] as HTMLElement | undefined;
    if (!element || !card) return;
    setPlaying(false);
    element.scrollTo({ left: card.offsetLeft, behavior: reduced ? "instant" : "smooth" });
  }

  useEffect(() => {
    if (!playing || !visible || hovered || focused || reduced) return;
    const timer = window.setInterval(() => { if (!document.hidden) move(1, true); }, variant === "hero" ? 6500 : 4200);
    return () => window.clearInterval(timer);
  }, [playing, visible, hovered, focused, reduced, variant]);

  const stop = () => setPlaying(false);
  return <div className={`store-slider slider-${variant}`} role="region" aria-label={label} aria-roledescription="carosello"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
    <div className="slider-track" ref={track} tabIndex={0} aria-label={`${label}: scorri o usa le frecce`}
      onWheel={stop}
      onKeyDown={event => {
        stop();
        if (event.target !== event.currentTarget) return;
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); }
        if (event.key === "Home" || event.key === "End") { event.preventDefault(); event.currentTarget.scrollTo({ left: event.key === "Home" ? 0 : event.currentTarget.scrollWidth, behavior: reduced ? "instant" : "smooth" }); }
      }}
      onPointerDown={event => {
        stop();
        drag.current.moved = false;
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        drag.current = { active: true, moved: false, start: event.clientX, scroll: event.currentTarget.scrollLeft };
      }}
      onPointerMove={event => {
        if (!drag.current.active) return;
        const delta = event.clientX - drag.current.start;
        if (Math.abs(delta) > 7) {
          drag.current.moved = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.classList.add("is-dragging");
          event.currentTarget.scrollLeft = drag.current.scroll - delta;
          event.preventDefault();
        }
      }}
      onPointerUp={event => {
        drag.current.active = false;
        event.currentTarget.classList.remove("is-dragging");
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={event => { drag.current.active = false; event.currentTarget.classList.remove("is-dragging"); }}
      onPointerLeave={() => { if (!drag.current.moved) drag.current.active = false; }}
      onClickCapture={event => { if (drag.current.moved) { event.preventDefault(); event.stopPropagation(); drag.current.moved = false; } }}
      onDragStart={event => event.preventDefault()}>
      {children}
    </div>
    <div className="slider-navigation">
      <div className="slider-hint"><span className="slider-count">{String(position.index + 1).padStart(2, "0")} <span>/ {String(position.total).padStart(2, "0")}</span></span><span className="slider-hint-text">TRASCINA. ESPLORA. TROVA IL TUO STILE.</span></div>
      {variant === "hero" ? <div className="cover-dots" aria-label="Scegli copertina">{Array.from({ length: position.total }, (_, index) => <button key={index} className={position.index === index ? "active" : ""} aria-label={`Vai alla copertina ${index + 1}`} aria-current={position.index === index ? "true" : undefined} onClick={() => goTo(index)}><span /></button>)}</div> : <div className="slider-progress" aria-hidden="true"><span style={{ transform: `translateX(${position.progress * 300}%)` }} /></div>}
      <div className="slider-buttons">
        {autoplay && <button className="slider-play" aria-label={playing ? "Pausa scorrimento automatico" : "Avvia scorrimento automatico"} aria-pressed={playing} disabled={reduced} onClick={() => setPlaying(!playing)}>{playing ? <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 3h2v10H4zM10 3h2v10h-2z" /></svg> : <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="m5 3 8 5-8 5z" /></svg>}</button>}
        <button className="slider-control" aria-label={`Precedenti: ${label}`} disabled={position.start} onClick={() => { stop(); move(-1); }}><Arrow previous /></button>
        <button className="slider-control" aria-label={`Successivi: ${label}`} disabled={position.end} onClick={() => { stop(); move(1); }}><Arrow /></button>
      </div>
    </div>
  </div>;
}
