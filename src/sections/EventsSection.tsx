import { Fragment, useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Globe,
  ExternalLink,
  CheckCircle2,
} from "lucide-react"
import { gsap, useScene } from "@/lib/gsap"
import { lockScroll, unlockScroll } from "@/lib/scroll-lock"
import { SectionHeading } from "@/components/SectionHeading"
import { events, type EventItem } from "../data/events"
import { useRepeatingImageModal } from "@/components/RepeatingImageTransitionModal"

// Builds a short, reader-facing narrative from the structured event data,
// so the full-page view reads like an in-depth blog post rather than a spec sheet.
function buildNarrative(event: EventItem): string[] {
  const paragraphs: string[] = [event.description]

  const logistics: string[] = [`This one runs on ${event.date}`]
  if (event.duration) logistics.push(`takes about ${event.duration.toLowerCase()}`)
  if (event.location) logistics.push(`happens at ${event.location}`)
  if (event.audience) logistics.push(`and is open to ${event.audience.toLowerCase()}`)
  paragraphs.push(logistics.join(", ") + ".")

  if (event.highlights && event.highlights.length > 0) {
    const preview = event.highlights.slice(0, 3).join(", ").toLowerCase()
    const more = event.highlights.length > 3 ? ", and a few more details below" : ""
    paragraphs.push(`Here's what you can expect once you're in: ${preview}${more}.`)
  }

  return paragraphs
}

const pill =
  "inline-flex items-center gap-2 border border-ink px-3.5 py-2 text-sm font-semibold text-ink"

export function EventsSection() {
  const { openImageModal } = useRepeatingImageModal()
  const root = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)

  const [activeEventId, setActiveEventId] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)

  const activeEvent: EventItem | null = events.find((e) => e.id === activeEventId) ?? null

  const openEvent = useCallback((id: string) => {
    lastFocus.current = document.activeElement as HTMLElement | null
    setActiveEventId(id)
    setActiveImage(0)
  }, [])

  const closeEvent = useCallback(() => setActiveEventId(null), [])

  const nextImage = useCallback(() => {
    if (!activeEvent) return
    setActiveImage((i) => (i + 1) % activeEvent.gallery.length)
  }, [activeEvent])

  const prevImage = useCallback(() => {
    if (!activeEvent) return
    setActiveImage((i) => (i - 1 + activeEvent.gallery.length) % activeEvent.gallery.length)
  }, [activeEvent])

  // Modal: shared scroll lock, keyboard, focus in / focus restore.
  useEffect(() => {
    if (!activeEvent) return
    lockScroll()
    closeRef.current?.focus({ preventScroll: true })

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeEvent()
      if (e.key === "ArrowRight") nextImage()
      if (e.key === "ArrowLeft") prevImage()
    }
    window.addEventListener("keydown", onKeyDown)

    return () => {
      unlockScroll()
      window.removeEventListener("keydown", onKeyDown)
      lastFocus.current?.focus({ preventScroll: true })
    }
  }, [activeEvent, closeEvent, nextImage, prevImage])

  // Scroll lock horizontal track from start to finish on mobile and all views.
  // Normal vertical page scroll smoothly and precisely drives the horizontal track with GSAP.
  useScene(
    root,
    (mm) => {
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const pin = pinRef.current
        const track = trackRef.current
        if (!pin || !track) return

        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", track)
        const dots = gsap.utils.toArray<HTMLElement>("[data-dot]", pin)
        const bar = pin.querySelector<HTMLElement>("[data-progress]")

        const distance = () => Math.max(0, track.scrollWidth - pin.clientWidth)

        let cardOffsets = cards.map((card) => card.offsetLeft)
        let lastActive = -1

        // Pin the section from start to finish and scroll horizontally
        // Multiplier 1.45 gives a relaxed, smooth, and precise slow scroll
        const horizontalTween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => `+=${Math.max(window.innerHeight * 2, Math.round(distance() * 1.45))}`,
            pin: true,
            scrub: 1.2,
            invalidateOnRefresh: true,
            onRefresh: () => {
              cardOffsets = cards.map((card) => card.offsetLeft)
            },
            onUpdate: (self) => {
              if (bar) gsap.set(bar, { scaleX: self.progress })
              // Active dot = precomputed card offset nearest viewport
              const x = self.progress * distance()
              let active = 0
              let best = Infinity
              for (let i = 0; i < cardOffsets.length; i++) {
                const d = Math.abs(cardOffsets[i] - x)
                if (d < best) {
                  best = d
                  active = i
                }
              }
              if (active !== lastActive) {
                lastActive = active
                dots.forEach((dot, i) => dot.toggleAttribute("data-active", i === active))
              }
            },
          },
        })

        // Gentle card reveal animation - NO clipping or off-screen masking!
        // Cards and images are ALWAYS 100% visible and beautifully rendered.
        cards.forEach((card, idx) => {
          if (idx === 0) return
          gsap.fromTo(
            card,
            { opacity: 0.75, scale: 0.97 },
            {
              opacity: 1,
              scale: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                containerAnimation: horizontalTween,
                start: "left right",
                end: "center center",
                scrub: true,
              },
            }
          )
        })
      })
    },
    []
  )

  return (
    <section id="events" ref={root} className="relative bg-transparent">
      <style>{`
        @keyframes ev-fadeIn { from { opacity: 0 } to { opacity: 1 } }

        .ev-scroller {
          position: relative;
          height: 100svh;
          overflow: hidden;
          touch-action: pan-y;
          background: var(--background);
          border-block: 1px solid #0a0a0a;
          width: 100%;
          z-index: 20;
        }

        .ev-track {
          display: flex;
          align-items: center;
          height: 100%;
          width: max-content;
          will-change: transform;
          padding: 0 4vw;
          gap: 3.5vw;
        }

        .ev-card {
          display: flex;
          box-sizing: border-box;
          border: 1px solid #0a0a0a;
          background: color-mix(in srgb, var(--background) 85%, transparent);
          backdrop-filter: blur(10px);
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .ev-card:hover {
          box-shadow: 0 12px 30px rgba(10, 10, 10, 0.08);
        }

        /* Mobile & Tablet (< 1024px): Stacked vertical card, BIG image, normal compact text */
        @media (max-width: 1023px) {
          .ev-card {
            flex-direction: column;
            flex: 0 0 min(86vw, 400px);
            width: min(86vw, 400px);
            height: 78svh;
            max-height: 560px;
            gap: 0;
            padding: 0.75rem;
          }
          .ev-media {
            width: 100%;
            height: 60%;
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
            background: rgba(10, 10, 10, 0.02);
            border-radius: 0.25rem;
          }
          .ev-media-inner {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .ev-media img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
            user-select: none;
          }
          .ev-body {
            flex: 1;
            padding: 0.6rem 0.25rem 0.15rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 0.35rem;
            min-height: 0;
          }
          .ev-title {
            margin: 0;
            font-family: 'Anton', sans-serif;
            text-transform: uppercase;
            font-weight: 400;
            letter-spacing: -0.01em;
            line-height: 1.08;
            color: #0a0a0a;
            font-size: 1.35rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .ev-desc {
            margin: 0;
            color: #525252;
            font-size: 0.825rem;
            line-height: 1.35;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }

        /* Desktop (>= 1024px): Side-by-side card, BIG image on left, normal compact text on right */
        @media (min-width: 1024px) {
          .ev-card {
            flex-direction: row;
            flex: 0 0 min(82vw, 1100px);
            width: min(82vw, 1100px);
            height: 75svh;
            max-height: 620px;
            gap: 2rem;
            padding: 1.5rem;
          }
          .ev-media {
            width: 58%;
            height: 100%;
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
            background: rgba(10, 10, 10, 0.02);
            border-radius: 0.375rem;
          }
          .ev-media-inner {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .ev-media img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
            user-select: none;
          }
          .ev-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 0.75rem;
            min-width: 0;
          }
          .ev-title {
            margin: 0;
            font-family: 'Anton', sans-serif;
            text-transform: uppercase;
            font-weight: 400;
            letter-spacing: -0.01em;
            line-height: 1.05;
            color: #0a0a0a;
            font-size: clamp(1.75rem, 2.4vw, 2.5rem);
          }
          .ev-desc {
            margin: 0;
            color: #525252;
            font-size: 0.9rem;
            line-height: 1.45;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }

        .ev-deco {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 0 2vw;
          font-family: 'Anton', sans-serif;
          font-size: clamp(4rem, 9vw, 8rem);
          line-height: .85;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1.5px #0a0a0a;
          pointer-events: none;
          user-select: none;
        }
        @media (max-width: 767px) {
          .ev-deco { display: none; }
        }

        .ev-dot {
          width: 1.5rem;
          height: 3px;
          background: rgba(10,10,10,.18);
          transition: background-color .3s, width .3s;
        }
        .ev-dot[data-active] {
          background: #0026ff;
          width: 2.25rem;
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-20 sm:px-6 sm:pb-12 sm:pt-28 lg:px-8">
        <SectionHeading
          index="13"
          eyebrow="Special Occasion & Events"
          title={
            <>
              Upcoming <span className="text-brand">Events</span> &amp; Competitions
            </>
          }
          lead="International Peace Day Speech Competition 2026 - Celebrating student talent, leadership, and eloquence."
        />
        <p className="label-mono mt-6 text-xs sm:text-sm text-mute">
          Keep scrolling to browse events →
        </p>
      </div>

      {/* ── Horizontal carousel: scroll-locked across all screens ── */}
      <div
        ref={pinRef}
        className="ev-scroller"
        tabIndex={0}
        aria-label="Events carousel"
      >
        <div ref={trackRef} className="ev-track">
          {events.map((event, index) => {
            const tagChips = [event.tag, event.audience, event.duration].filter(Boolean).slice(0, 3) as string[]
            const decoAfter =
              index === 1 ? ["learn", "compete"] : index === 3 ? ["shine", "grow"] : null

            return (
              <Fragment key={event.id}>
                <article data-card className="ev-card">
                  <div className="ev-media">
                    <div className="ev-media-inner">
                      <img
                        src={event.coverImage}
                        alt={event.title}
                        draggable={false}
                        loading={index > 1 ? "lazy" : undefined}
                      />
                    </div>
                  </div>

                  <div className="ev-body">
                    <div className="flex flex-col gap-1">
                      <span className="label-mono text-brand text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                        {event.tag}
                      </span>
                      <h3 className="ev-title">{event.title}</h3>
                      <p className="ev-desc">{event.summary}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {tagChips.map((t) => (
                        <span key={t} className="label-mono text-[10px] text-mute">
                          #{t.replace(/\s+/g, "")}
                        </span>
                      ))}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => openEvent(event.id)}
                        className="label-mono inline-flex h-8 sm:h-9 items-center bg-ink px-5 sm:px-6 text-white text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors duration-300 hover:bg-brand active:scale-95"
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                </article>

                {decoAfter && (
                  <div className="ev-deco" aria-hidden="true">
                    <span>{decoAfter[0]}</span>
                    <span>{decoAfter[1]}</span>
                  </div>
                )}
              </Fragment>
            )
          })}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-4 sm:bottom-6 z-10 flex flex-col items-center gap-2 sm:gap-2.5 px-4 sm:px-8">
          <div className="flex gap-1.5">
            {events.map((event, i) => (
              <span key={event.id} data-dot data-active={i === 0 ? "" : undefined} className="ev-dot" />
            ))}
          </div>
          <span className="relative block h-px w-full max-w-xs bg-ink/15">
            <span
              data-progress
              className="absolute inset-y-0 left-0 block h-px w-full origin-left scale-x-0 bg-ink"
            />
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
           Full-screen blog-like popup modal
         ═══════════════════════════════════════════ */}
      {activeEvent &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={activeEvent.title}
            className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-white/85 backdrop-blur-md text-ink animate-[ev-fadeIn_0.2s_ease-out]"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={closeEvent}
              className="fixed right-4 top-4 sm:right-6 sm:top-6 z-20 flex items-center justify-center p-2 text-ink/80 hover:text-brand transition-colors duration-200 cursor-pointer focus:outline-none"
              aria-label="Close"
            >
              <X className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={2.2} />
            </button>

            {/* Banner: Transparent + Backdrop-blur-md (No dark popup) */}
            <div className="border-b border-ink/15 bg-white/60 backdrop-blur-md px-6 pb-16 pt-20 text-ink sm:px-12 sm:pb-24 sm:pt-28">
              <div className="mx-auto max-w-3xl space-y-5">
                <span className="label-mono inline-block rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-brand font-semibold">
                  {activeEvent.tag}
                </span>
                <h1 className="font-anton uppercase text-[clamp(2.5rem,6vw,4.5rem)] leading-[1] tracking-tight text-ink">
                  {activeEvent.title}
                </h1>
                <p className="text-sm font-medium text-mute sm:text-base">{activeEvent.summary}</p>
              </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-3xl space-y-10 px-6 py-10 sm:px-8 sm:py-14">
              <div className="flex flex-wrap gap-3">
                <span className={pill}>
                  <Calendar className="h-4 w-4 shrink-0 text-brand" />
                  {activeEvent.date}
                </span>
                {activeEvent.duration && (
                  <span className={pill}>
                    <Clock className="h-4 w-4 shrink-0 text-brand" />
                    {activeEvent.duration}
                  </span>
                )}
                {activeEvent.audience && (
                  <span className={pill}>
                    <Users className="h-4 w-4 shrink-0 text-brand" />
                    {activeEvent.audience}
                  </span>
                )}
                {activeEvent.location && (
                  <span className={pill}>
                    <MapPin className="h-4 w-4 shrink-0 text-brand" />
                    {activeEvent.location}
                  </span>
                )}
              </div>

              {/* object-contain so posters/flyers are never cropped */}
              <div
                className="relative flex max-h-[75vh] w-full items-center justify-center overflow-hidden rounded-xl bg-transparent cursor-pointer group"
                title="Click to scale up poster with Effect 04 transition"
                onClick={(e) => {
                  const img = e.currentTarget.querySelector("img") || e.currentTarget;
                  openImageModal(img as HTMLElement, {
                    src: activeEvent.gallery[activeImage],
                    title: activeEvent.title,
                    subtitle: `${activeEvent.tag} • Poster ${activeImage + 1} of ${activeEvent.gallery.length}`,
                    category: "Event Archive & Visuals",
                    badge: activeEvent.tag,
                    description: activeEvent.summary,
                    meta: [
                      ...(activeEvent.audience ? [{ label: "Target Audience", value: activeEvent.audience }] : []),
                      ...(activeEvent.duration ? [{ label: "Duration", value: activeEvent.duration }] : []),
                      { label: "Date", value: activeEvent.date },
                      ...(activeEvent.location ? [{ label: "Location", value: activeEvent.location }] : []),
                    ],
                  });
                }}
              >
                <img
                  key={activeImage}
                  src={activeEvent.gallery[activeImage]}
                  alt={`${activeEvent.title} image ${activeImage + 1}`}
                  className="max-h-[75vh] w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                />

                {activeEvent.gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink/15 bg-white/85 backdrop-blur-md text-ink transition-all hover:bg-brand hover:text-white"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink/15 bg-white/85 backdrop-blur-md text-ink transition-all hover:bg-brand hover:text-white"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {activeEvent.gallery.length > 1 && (
                <div className="-mt-4 flex gap-2">
                  {activeEvent.gallery.map((src, i) => (
                    <button
                      type="button"
                      key={src + i}
                      onClick={() => setActiveImage(i)}
                      aria-label={`Show image ${i + 1}`}
                      className={
                        "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-opacity " +
                        (i === activeImage ? "border-brand" : "border-ink/10 opacity-60 hover:opacity-100")
                      }
                    >
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <h2 className="font-anton uppercase text-3xl tracking-tight">About this event</h2>
                {buildNarrative(activeEvent).map((paragraph, i) => (
                  <p key={i} className="text-base leading-relaxed text-mute">
                    {paragraph}
                  </p>
                ))}
              </div>

              {activeEvent.highlights && activeEvent.highlights.length > 0 && (
                <div className="space-y-3">
                  <p className="label-mono text-ink/50">What&apos;s included</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {activeEvent.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2.5 rounded-lg border border-ink/15 bg-white/60 backdrop-blur-md px-4 py-3 text-sm font-semibold text-ink">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeEvent.contact && (
                <div className="flex flex-wrap gap-2 border-t border-ink/15 pt-6">
                  {activeEvent.contact.whatsapp && (
                    <a
                      href={"https://wa.me/" + activeEvent.contact.whatsapp.replace(/\D/g, "")}
                      target="_blank"
                      rel="noreferrer"
                      className="label-mono inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-white transition-colors hover:bg-brand/90"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  )}
                  {activeEvent.contact.formLink && (
                    <a
                      href={activeEvent.contact.formLink}
                      target="_blank"
                      rel="noreferrer"
                      className="label-mono inline-flex h-11 items-center gap-2 rounded-lg border border-ink/20 bg-white/70 backdrop-blur-md px-5 text-ink transition-colors hover:bg-brand hover:text-white hover:border-brand"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Register
                    </a>
                  )}
                  {activeEvent.contact.website && (
                    <a
                      href={activeEvent.contact.website}
                      target="_blank"
                      rel="noreferrer"
                      className="label-mono inline-flex h-11 items-center gap-2 rounded-lg border border-ink/20 bg-white/70 backdrop-blur-md px-5 text-ink transition-colors hover:bg-brand hover:text-white hover:border-brand"
                    >
                      <Globe className="h-3.5 w-3.5" /> Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </section>
  )
}

export default EventsSection
