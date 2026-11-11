import { Children, useEffect, useRef, useState, type ReactNode } from "react"

type Props = {
  children: ReactNode
  label: string
  variant?: "products" | "categories" | "hero"
  autoplay?: boolean
}

function wrap(value: number, total: number) {
  return total ? ((value % total) + total) % total : 0
}

function distance(index: number, position: number, total: number) {
  return wrap(index - position + total / 2, total) - total / 2
}

export default function DepthSlider({
  children,
  label,
  variant = "products",
  autoplay = false,
}: Props) {
  const cards = Children.toArray(children)
  const count = cards.length
  const stage = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [playing, setPlaying] = useState(autoplay)
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [reduced, setReduced] = useState(false)
  const current = useRef(0)
  const gesture = useRef({ active: false, moved: false, x: 0, start: 0 })
  const frame = useRef(0)
  const active = wrap(Math.round(position), count)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => {
      setReduced(media.matches)
      if (media.matches) setPlaying(false)
    }
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    const element = stage.current
    if (!element) return
    const measure = () => {
      const contents = Array.from(
        element.querySelectorAll<HTMLElement>(".depth-content"),
      )
      const height = Math.max(0, ...contents.map((card) => card.offsetHeight))
      element.style.setProperty("--depth-height", `${height + 65}px`)
    }
    const resize = new ResizeObserver(measure)
    element
      .querySelectorAll(".depth-content")
      .forEach((card) => resize.observe(card))
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 },
    )
    observer.observe(element)
    measure()
    return () => {
      resize.disconnect()
      observer.disconnect()
    }
  }, [children])

  function settle(next: number) {
    cancelAnimationFrame(frame.current)
    frame.current = 0
    current.current = next
    setPosition(next)
    setDragging(false)
    gesture.current.active = false
  }

  useEffect(() => {
    if (!playing || !visible || hovered || focused || reduced || count < 2)
      return
    const timer = window.setInterval(
      () => {
        if (!document.hidden) settle(Math.round(current.current) + 1)
      },
      variant === "hero" ? 6500 : 4500,
    )
    return () => window.clearInterval(timer)
  }, [playing, visible, hovered, focused, reduced, count, variant])

  function finish(cancelled = false) {
    if (!gesture.current.active) return
    const delta = current.current - gesture.current.start
    settle(
      !cancelled && Math.abs(delta) > 0.18
        ? gesture.current.start + Math.sign(delta)
        : gesture.current.start,
    )
  }

  function navigate(next: number) {
    setPlaying(false)
    settle(next)
  }

  if (!count) return null
  return (
    <div
      className={`depth-carousel depth-${variant} slider-${variant} ${
        dragging ? "is-dragging" : ""
      }`}
      role="region"
      aria-roledescription="carosello"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setFocused(false)
      }}
    >
      <div
        className="depth-stage"
        ref={stage}
        tabIndex={0}
        aria-label={`${label}: scorri con le dita o usa le frecce`}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault()
            navigate(
              Math.round(current.current) +
                (event.key === "ArrowRight" ? 1 : -1),
            )
          }
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) return
          setPlaying(false)
          cancelAnimationFrame(frame.current)
          frame.current = 0
          const start = Math.round(current.current)
          gesture.current = {
            active: true,
            moved: false,
            x: event.clientX,
            start,
          }
          current.current = start
        }}
        onPointerMove={(event) => {
          if (!gesture.current.active) return
          const delta = event.clientX - gesture.current.x
          if (Math.abs(delta) < 7 && !gesture.current.moved) return
          gesture.current.moved = true
          event.currentTarget.setPointerCapture(event.pointerId)
          const step = Math.max(1, event.currentTarget.clientWidth * 0.4)
          current.current =
            gesture.current.start - Math.max(-1, Math.min(1, delta / step))
          setDragging(true)
          if (!frame.current)
            frame.current = requestAnimationFrame(() => {
              frame.current = 0
              setPosition(current.current)
            })
        }}
        onPointerUp={(event) => {
          finish()
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId)
        }}
        onPointerCancel={() => finish(true)}
        onPointerLeave={() => {
          if (!gesture.current.moved) gesture.current.active = false
        }}
        onClickCapture={(event) => {
          if (gesture.current.moved) {
            event.preventDefault()
            event.stopPropagation()
            gesture.current.moved = false
          }
        }}
        onDragStart={(event) => event.preventDefault()}
      >
        {cards.map((card, index) => {
          const offset = distance(index, position, count)
          const depth = Math.abs(offset)
          const hidden = depth > 1.85
          return (
            <div
              key={index}
              className={`depth-card ${index === active ? "is-front" : ""}`}
              style={{
                transform: `translate3d(calc(-50% + ${offset} * var(--card-spread, 76%)), ${Math.min(depth, 2) * 22}px, ${-Math.min(depth, 2) * 60}px) rotateY(${
                  reduced ? 0 : -offset * 7
                }deg) scale(${1 - Math.min(depth, 2) * 0.09})`,
                opacity: hidden ? 0 : 1 - Math.min(depth, 1.85) * 0.28,
                zIndex: 100 - Math.round(depth * 30),
                pointerEvents: hidden ? "none" : "auto",
              }}
              onClickCapture={(event) => {
                if (index !== active) {
                  event.preventDefault()
                  event.stopPropagation()
                  navigate(
                    Math.round(current.current) +
                      distance(index, Math.round(current.current), count),
                  )
                }
              }}
            >
              <div className="depth-content" inert={index !== active}>
                {card}
              </div>
            </div>
          )
        })}
      </div>
      <div className="depth-navigation">
        <span className="slider-count">
          {String(active + 1).padStart(2, "0")}{" "}
          <span>/ {String(count).padStart(2, "0")}</span>
        </span>
        <div className="depth-dots" aria-label="Scegli scheda">
          {cards.map((_, index) => (
            <button
              key={index}
              className={active === index ? "active" : ""}
              aria-label={`Mostra scheda ${index + 1}`}
              aria-current={active === index ? "true" : undefined}
              onClick={() =>
                navigate(
                  Math.round(current.current) +
                    distance(index, Math.round(current.current), count),
                )
              }
            >
              <span />
            </button>
          ))}
        </div>
        <div className="depth-controls">
          {autoplay && (
            <button
              className="slider-play"
              aria-label={
                playing
                  ? "Pausa scorrimento automatico"
                  : "Avvia scorrimento automatico"
              }
              aria-pressed={playing}
              disabled={reduced}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? "Ⅱ" : "▷"}
            </button>
          )}
          <button
            className="slider-control depth-prev"
            aria-label={`Precedente: ${label}`}
            onClick={() => navigate(Math.round(current.current) - 1)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M4 12h16m-6-6 6 6-6 6" />
            </svg>
          </button>
          <button
            className="slider-control"
            aria-label={`Successiva: ${label}`}
            onClick={() => navigate(Math.round(current.current) + 1)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M4 12h16m-6-6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
      <span
        className="sr-only"
        aria-live={playing || dragging ? "off" : "polite"}
        aria-atomic="true"
      >
        Scheda {active + 1} di {count}
      </span>
    </div>
  )
}
