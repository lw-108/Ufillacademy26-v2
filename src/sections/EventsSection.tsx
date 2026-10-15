import { useCallback, useEffect, useRef, useState } from "react"
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
import { gsap, CONDITIONS, useScene } from "@/lib/gsap"
import { useMediaQuery } from "@/lib/use-media-query"
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

  // A pinned, scroll-driven horizontal track needs a desktop with motion
  // allowed. Everyone else gets a native, swipeable scroll-snap row.
  const pinned = useMediaQuery(CONDITIONS.full)

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

  useScene(
    root,
    (mm) => {
      mm.add(CONDITIONS.full, () => {
        const pin = pinRef.current
        const track = trackRef.current
        if (!pin || !track) return

        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", track)
        const dots = gsap.utils.toArray<HTMLElement>("[data-dot]", pin)
        const bar = pin.querySelector<HTMLElement>("[data-progress]")

        const distance = () => Math.max(0, track.scrollWidth - pin.clientWidth)

        let cardOffsets = cards.map((card) => card.offsetLeft)
        let lastActive = -1

        const horizontalTween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: () => {
              cardOffsets = cards.map((card) => card.offsetLeft)
            },
            onUpdate: (self) => {
              if (bar) gsap.set(bar, { scaleX: self.progress })
              // Active dot = precomputed card offset nearest the viewport (zero layout thrashing)
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

        // MainEvent-style expanding image effect for event cards:
        // First card reveals as user scrolls into the section
        const firstCard = cards[0]
        if (firstCard) {
          const maskEl = firstCard.querySelector<HTMLElement>(".ev-media")
          const innerEl = firstCard.querySelector<HTMLElement>(".ev-media-inner")
          if (maskEl && innerEl) {
            gsap
              .timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                  trigger: pin,
                  start: "top bottom-=15%",
                  end: "top top",
                  scrub: true,
                },
              })
              .fromTo(
                maskEl,
                { yPercent: -100, xPercent: 100 },
                { yPercent: 0, xPercent: 0 }
              )
              .fromTo(
                innerEl,
                { yPercent: 100, xPercent: -100 },
                { yPercent: 0, xPercent: 0 },
                0
              )
          }
        }

        // Subsequent cards reveal as they slide horizontally into view
        cards.slice(1).forEach((card, idx) => {
          const isLeftSide = idx % 2 === 0
          const maskEl = card.querySelector<HTMLElement>(".ev-media")
          const innerEl = card.querySelector<HTMLElement>(".ev-media-inner")
          if (!maskEl || !innerEl) return

          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: card,
                containerAnimation: horizontalTween,
                start: "left right",
                end: "center center",
                scrub: true,
              },
            })
            .fromTo(
              maskEl,
              {
                yPercent: -100,
                xPercent: isLeftSide ? 100 : -100,
              },
              {
                yPercent: 0,
                xPercent: 0,
              }
            )
            .fromTo(
              innerEl,
              {
                yPercent: 100,
                xPercent: isLeftSide ? -100 : 100,
              },
              {
                yPercent: 0,
                xPercent: 0,
              },
              0
            )
        })
      })

      mm.add(CONDITIONS.simple, () => {
        const track = trackRef.current
        if (!track) return
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", track)
        cards.forEach((card, idx) => {
          const isLeftSide = idx % 2 === 0
          const maskEl = card.querySelector<HTMLElement>(".ev-media")
          const innerEl = card.querySelector<HTMLElement>(".ev-media-inner")
          if (!maskEl || !innerEl) return

          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: card,
                start: "top bottom-=15%",
                end: "+=50%",
                scrub: true,
              },
            })
            .fromTo(
              maskEl,
              { yPercent: -100, xPercent: isLeftSide ? 100 : -100 },
              { yPercent: 0, xPercent: 0 }
            )
            .fromTo(
              innerEl,
              { yPercent: 100, xPercent: isLeftSide ? -100 : 100 },
              { yPercent: 0, xPercent: 0 },
              0
            )
        })
      })
    },
    [pinned]
  )

  return (
    <section id="events" ref={root} className="relative bg-transparent">
      <style>{`
        @keyframes ev-fadeIn { from { opacity: 0 } to { opacity: 1 } }

        /* The scroller is a size container so cards can be exactly one
           viewport-of-the-scroller wide (cqw) — 100vw would include the
           page scrollbar and push the last card off-centre. */
        .ev-scroller { position: relative; container-type: inline-size; background: transparent; border-block: 1px solid #0a0a0a; }
        .ev-scroller[data-mode="pinned"] { height: 100svh; overflow: hidden; touch-action: pan-y; }
        .ev-scroller[data-mode="native"] { overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x mandatory; scrollbar-width: none; }
        .ev-scroller[data-mode="native"]::-webkit-scrollbar { display: none; }

        .ev-track { display: flex; align-items: center; width: max-content; }
        .ev-scroller[data-mode="pinned"] .ev-track { height: 100%; will-change: transform; }
        .ev-scroller[data-mode="native"] .ev-track { padding: 2rem 1rem; gap: 1rem; align-items: stretch; }

        .ev-card { display: flex; gap: 2rem; box-sizing: border-box; }
        .ev-scroller[data-mode="pinned"] .ev-card { flex: 0 0 100cqw; width: 100cqw; height: 78svh; padding: 0 5cqw; }
        .ev-scroller[data-mode="native"] .ev-card { flex: 0 0 86cqw; width: 86cqw; flex-direction: column; gap: 0; border: 1px solid #0a0a0a; scroll-snap-align: center; }

        .ev-media { position: relative; overflow: hidden; background: transparent; border: none; }
        .ev-scroller[data-mode="pinned"] .ev-media { width: 56%; height: 100%; flex-shrink: 0; border: none; }
        .ev-scroller[data-mode="native"] .ev-media { width: 100%; aspect-ratio: 4 / 3; border: none; }
        .ev-media-inner { width: 100%; height: 100%; will-change: transform; display: flex; align-items: center; justify-content: center; }
        .ev-media img { width: 100%; height: 100%; object-fit: contain; display: block; user-select: none; }

        .ev-body { display: flex; flex-direction: column; gap: .9rem; min-width: 0; }
        .ev-scroller[data-mode="pinned"] .ev-body { flex: 1; justify-content: center; }
        .ev-scroller[data-mode="native"] .ev-body { padding: 1.25rem; flex: 1; }

        .ev-title { margin: 0; font-family: 'Anton', sans-serif; text-transform: uppercase; font-weight: 400; letter-spacing: -0.01em; line-height: 0.95; color: #0a0a0a; font-size: clamp(2.25rem, 4.2vw, 4rem); }
        .ev-scroller[data-mode="native"] .ev-title { font-size: 2rem; }
        .ev-desc { margin: 0; color: #525252; font-size: 1rem; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; }

        .ev-deco { flex: 0 0 auto; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 0 4cqw; font-family: 'Anton', sans-serif; font-size: clamp(5rem, 13cqw, 11rem); line-height: .85; text-transform: uppercase; color: transparent; -webkit-text-stroke: 1.5px #0a0a0a; pointer-events: none; user-select: none; }
        .ev-scroller[data-mode="native"] .ev-deco { display: none; }

        .ev-dot { width: 1.5rem; height: 3px; background: rgba(10,10,10,.15); transition: background-color .3s; }
        .ev-dot[data-active] { background: #0026ff; }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-32 lg:px-8">
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
        <p className="label-mono mt-8 text-mute">
          {pinned ? "Keep scrolling to browse →" : "Swipe to browse →"}
        </p>
      </div>

      {/* ── Horizontal carousel ── */}
      <div
        ref={pinRef}
        className="ev-scroller"
        data-mode={pinned ? "pinned" : "native"}
        tabIndex={pinned ? undefined : 0}
        aria-label="Events carousel"
      >
        <div ref={trackRef} className="ev-track">
          {events.map((event, index) => {
            const tagChips = [event.tag, event.audience, event.duration].filter(Boolean).slice(0, 3) as string[]
            const decoAfter =
              index === 1 ? ["learn", "compete"] : index === 3 ? ["shine", "grow"] : null

            return (
              <div key={event.id} style={{ display: "contents" }}>
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
                    <span className="label-mono text-brand">{event.tag}</span>
                    <h3 className="ev-title">{event.title}</h3>
                    <p className="ev-desc">{event.summary}</p>

                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {tagChips.map((t) => (
                        <span key={t} className="label-mono text-[10px] text-mute">
                          #{t.replace(/\s+/g, "")}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => openEvent(event.id)}
                      className="label-mono mt-2 inline-flex h-12 w-max items-center bg-ink px-8 text-white transition-colors duration-300 hover:bg-brand"
                    >
                      Explore
                    </button>
                  </div>
                </article>

                {decoAfter && (
                  <div className="ev-deco" aria-hidden="true">
                    <span>{decoAfter[0]}</span>
                    <span>{decoAfter[1]}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {pinned && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-3 px-8">
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
        )}
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
