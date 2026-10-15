import { useRef } from "react"
import { Maximize2 } from "lucide-react"
import { gsap, MQ, useScene } from "@/lib/gsap"
import { SectionHeading } from "@/components/SectionHeading"
import { useRepeatingImageModal } from "@/components/RepeatingImageTransitionModal"

/**
 * MainEvent — Our Main Events Exhibition
 *
 * Implements:
 * 1. Big standalone event numbers alone ("01", "02") before each event's content.
 * 2. Big, fully showing Cover Image and Guest Image without background color,
 *    responsively sized and compact for every screen type.
 * 3. Dual-axis sliding-mask expanding effect powered by GSAP ScrollTrigger
 *    for Cover Images, Guest Images, and Photographic Gallery items.
 * 4. GSAP-powered click-to-expand modal and smooth hover expansion.
 * 5. Transparent background, crisp black text (#0a0a0a), and U-Fill brand blue (#0026ff) year accents.
 */

interface GalleryItem {
  id: string
  r: number
  c: number
  s: number
  title: string
  year: string
  alt: string
  src: string
}

interface EventData {
  id: string
  num: string
  year: string
  eyebrow: string
  tamil: string
  title: string
  titleEm: string
  body: string[]
  guest: {
    name: string
    role: string
    photo: string
    citation?: string
  }
  coverImage: {
    src: string
    alt: string
    title: string
  }
  gallery: GalleryItem[]
}

const mainEvents: EventData[] = [
  {
    id: "peace-day-2026",
    num: "01",
    year: "2026",
    eyebrow: "Special Occasion",
    tamil: "சர்வதேச அமைதி தினம் பேச்சுப் போட்டி 2026",
    title: "Words of Gratitude",
    titleEm: "for Our Special Guest",
    body: [
      "As we come to the end of this wonderful event, we would like to express our sincere gratitude to our respected special guest, Mr. Vasanth Kumar, Assistant Professor, Akshaya College of Arts and Science, Coimbatore.",
      "His presence made this occasion even more memorable and meaningful. Throughout the event, he offered tremendous support, valuable guidance, and constant encouragement to everyone present.",
    ],
    guest: {
      name: "Mr. Vasanth Kumar",
      role: "Assistant Professor, Akshaya College of Arts and Science, Coimbatore",
      photo: "/images/teddy.png",
      citation:
        "Honored for presiding over International Peace Day 2026, delivering the honorary keynote address, and offering constant encouragement to all student delegates.",
    },
    coverImage: {
      src: "https://m.media-amazon.com/images/M/MV5BMTAxOTQ0MjUzMzJeQTJeQWpwZ15BbWU4MDY0NTAxNzMx._V1_.jpg",
      alt: "Mr. Vasanth Kumar addressing the gathering",
      title: "Keynote Address by Mr. Vasanth Kumar",
    },
    gallery: [
      {
        id: "peace-g-1",
        r: 1,
        c: 4,
        s: 4,
        title: "Dignitary Reception",
        year: "2026",
        alt: "Chief guest arriving at the event",
        src: "https://images.wsj.net/im-597081?width=1280&size=1",
      },
      {
        id: "peace-g-2",
        r: 2,
        c: 1,
        s: 3,
        title: "Speaker Remarks",
        year: "2026",
        alt: "Speaker addressing the audience",
        src: "https://variety.com/wp-content/uploads/2020/06/bob-odenkirk.jpg?w=1000&h=563&crop=1",
      },
      {
        id: "peace-g-3",
        r: 3,
        c: 5,
        s: 3,
        title: "Honorary Memento Presentation",
        year: "2026",
        alt: "Memento being presented to the special guest",
        src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3MlKVHNiFJ3Aft3XYRtb87RUEtONKZ3Z0TV2SVKrc5fksNsoips7X7qk&s=10",
      },
      {
        id: "peace-g-4",
        r: 4,
        c: 2,
        s: 5,
        title: "Student Delegation Celebration",
        year: "2026",
        alt: "Student participants and audience celebration",
        src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80",
      },
    ],
  },
  {
    id: "kavery-workshop-2025",
    num: "02",
    year: "2025",
    eyebrow: "The Kavery Engineering College",
    tamil: "தேசிய தொழில்நுட்ப பயிலரங்கம் & நேரடி வழிகாட்டுதல் 2025",
    title: "National Technical Workshop",
    titleEm: "& Hands-on Mentorship",
    body: [
      "U Fill Academy organized a comprehensive one-day national-level technical workshop focusing on AI, IoT, and Drone applications in precision engineering at The Kavery Engineering College, Mecheri, Salem.",
      "Led by CEO Mr. M. Muthubalaji and Deputy Managing Director Mr. S. Hari Krishnan, students gained immersive exposure to rapid prototyping, agricultural sensor integration, and real-time autonomous systems.",
    ],
    guest: {
      name: "Dr. A. K. Sundaresan",
      role: "Dean of Academic Research, The Kavery Engineering College",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&w=1200&q=85",
      citation:
        "Recognized for distinguished academic leadership, research mentorship, and championing hands-on AI, IoT & Autonomous Robotics workshops.",
    },
    coverImage: {
      src: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1400&q=80",
      alt: "Mentors addressing the student cohort at APJ Hall",
      title: "Mentors Addressing Students at APJ Hall",
    },
    gallery: [
      {
        id: "kavery-g-1",
        r: 1,
        c: 4,
        s: 4,
        title: "Precision Tech Keynote",
        year: "2025",
        alt: "Interactive keynote presentation on precision tech",
        src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1400&q=80",
      },
      {
        id: "kavery-g-2",
        r: 2,
        c: 1,
        s: 3,
        title: "Dignitaries Felicitation",
        year: "2025",
        alt: "Dignitaries and U Fill leadership felicitation",
        src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
      },
      {
        id: "kavery-g-3",
        r: 3,
        c: 5,
        s: 3,
        title: "Collaborative Student Ideation",
        year: "2025",
        alt: "Students collaborating during group ideation round",
        src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1400&q=80",
      },
      {
        id: "kavery-g-4",
        r: 4,
        c: 2,
        s: 5,
        title: "Robotics Prototyping & Live Trials",
        year: "2025",
        alt: "Hands-on robotics prototyping and live demonstration",
        src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80",
      },
    ],
  },
]

export function MainEvent() {
  const sectionRef = useRef<HTMLElement>(null)
  const { openImageModal } = useRepeatingImageModal()

  // GSAP ScrollTrigger animation for Featured Media (Cover & Guest) & Codrops ConnectedGrid
  useScene(sectionRef, (mm) => {
    mm.add(MQ.motion, () => {
      const section = sectionRef.current
      if (!section) return

      // 1. Featured Media Items (Cover Images & Guest Images): Dual-Axis Sliding-Mask Expanding Reveal
      const mediaItems = section.querySelectorAll<HTMLElement>(".js-main-event-media")
      mediaItems.forEach((item, idx) => {
        const isLeftSide = item.dataset.side === "left" || idx % 2 === 0
        const maskEl = item.querySelector<HTMLElement>(".js-media-mask")
        const innerEl = item.querySelector<HTMLElement>(".js-media-inner")
        if (!maskEl || !innerEl) return

        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: item,
              start: "top bottom-=12%",
              end: "+=55%",
              scrub: true,
            },
          })
          .fromTo(
            maskEl,
            {
              yPercent: -100,
              xPercent: isLeftSide ? 80 : -80,
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
              xPercent: isLeftSide ? -80 : 80,
              scale: 1.08,
            },
            {
              yPercent: 0,
              xPercent: 0,
              scale: 1,
            },
            0
          )
      })

      // 2. Codrops ConnectedGrid Demo 2 Gallery Items
      const items = section.querySelectorAll<HTMLElement>(".grid__item")
      if (!items || items.length === 0) return

      items.forEach((item) => {
        const previousElementSibling = item.previousElementSibling as HTMLElement | null
        const isLeftSide =
          previousElementSibling &&
          item.offsetLeft + item.offsetWidth <= previousElementSibling.offsetLeft + 1

        const imgEl = item.querySelector<HTMLElement>(".grid__item-img")
        const imgInnerEl = item.querySelector<HTMLElement>(".grid__item-img-inner")
        const captionEl = item.querySelector<HTMLElement>(".grid__item-caption")

        if (!imgEl || !imgInnerEl || !captionEl) return

        gsap
          .timeline({
            defaults: {
              ease: "none",
            },
            scrollTrigger: {
              trigger: item,
              start: "top bottom-=15%",
              end: "+=50%",
              scrub: true,
            },
          })
          .fromTo(
            imgEl,
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
            imgInnerEl,
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
          .fromTo(
            captionEl,
            {
              yPercent: 200,
              xPercent: 50,
              opacity: 0,
            },
            {
              yPercent: 0,
              xPercent: 0,
              opacity: 1,
            },
            0
          )
      })
    })
  })

  return (
    <section
      ref={sectionRef}
      id="main-event"
      className="connected-grid-section relative w-full overflow-hidden bg-transparent px-4 py-20 text-ink sm:px-6 sm:py-28 lg:px-8"
    >
      {/* ── Section Heading ── */}
      <div className="mx-auto max-w-7xl mb-16 sm:mb-24">
        <SectionHeading
          index="12"
          eyebrow="Our Events"
          title={
            <>
              Our Main <span className="text-brand">Events</span>
            </>
          }
          lead="Photographic archive capturing memorable keynotes, leadership addresses, and hands-on technical workshops."
        />
      </div>

      <div className="mx-auto max-w-7xl space-y-24 sm:space-y-32">
        {mainEvents.map((event, eventIdx) => {
          const isReversed = eventIdx % 2 === 1

          return (
            <div key={event.id} className="relative">
              {/* ── 1. Big Event Number Alone ── */}
              <div className="mb-10 sm:mb-14 border-b border-ink/15 pb-4 flex items-baseline justify-between">
                <span className="font-anton text-8xl sm:text-9xl lg:text-[11rem] text-ink leading-none tracking-tighter select-none">
                  {event.num}
                </span>
                <div className="text-right">
                  <span className="label-mono text-xs font-bold text-brand uppercase tracking-wider block">
                    EVENT ARCHIVE &middot; {event.year}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-ink/75">
                    {event.tamil}
                  </span>
                </div>
              </div>

              {/* ── 2. Event's Story & Primary Cover Exhibition (Big Image, Fully Showing, No BG) ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12 sm:mb-16">
                {/* Big Cover Image with GSAP Expanding Effect */}
                <div
                  className={`w-full lg:col-span-7 flex justify-center items-center ${
                    isReversed ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <div
                    className="js-main-event-media w-full flex flex-col items-center justify-center bg-transparent"
                    data-side={isReversed ? "right" : "left"}
                  >
                    <div
                      onClick={(e) => {
                        openImageModal(e.currentTarget, {
                          src: event.coverImage.src,
                          title: event.coverImage.title,
                          subtitle: `${event.eyebrow} · ${event.year}`,
                          category: "Event Photographic Archive",
                          badge: `${event.year} Conformance`,
                          description: event.coverImage.alt,
                          meta: [
                            { label: "Occasion", value: event.tamil },
                            { label: "Year", value: event.year },
                            { label: "Role", value: "Primary Cover Exhibition" },
                          ],
                        })
                      }}
                      title={`Click to inspect cover: ${event.coverImage.alt}`}
                      className="js-media-mask group relative w-full flex items-center justify-center cursor-pointer overflow-hidden bg-transparent"
                    >
                      <div className="js-media-inner will-change-transform w-full flex items-center justify-center bg-transparent py-2 sm:py-3">
                        <img
                          src={event.coverImage.src}
                          alt={event.coverImage.alt}
                          loading="lazy"
                          decoding="async"
                          className="w-auto h-auto max-h-[280px] sm:max-h-[360px] md:max-h-[420px] lg:max-h-[480px] max-w-full object-contain bg-transparent transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                        />
                      </div>
                    </div>

                    {/* Minimal Caption Under Cover Image */}
                    <div className="w-full flex items-center justify-between pt-2.5 text-xs text-ink/65 font-mono">
                      <span className="truncate">{event.coverImage.title}</span>
                      <span className="text-brand font-semibold shrink-0 ml-2">PRIMARY COVER</span>
                    </div>
                  </div>
                </div>

                {/* Event Description Paragraph Near Cover Image */}
                <div
                  className={`w-full lg:col-span-5 flex flex-col justify-center space-y-4 ${
                    isReversed ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                    <span className="label-mono text-xs text-brand font-bold uppercase tracking-wider">
                      {event.eyebrow} &middot; {event.year}
                    </span>
                  </div>

                  <h3 className="font-anton uppercase text-3xl sm:text-4xl text-ink leading-[1.1] tracking-tight">
                    <span>{event.title}</span>{" "}
                    <span className="text-brand">{event.titleEm}</span>
                  </h3>

                  <p className="text-sm font-semibold text-ink/75 font-sans">
                    {event.tamil}
                  </p>

                  <div className="space-y-3 text-base leading-relaxed text-ink/85 font-sans">
                    {event.body.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Archive Metadata Tags */}
                  <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
                    <span className="px-2.5 py-1 border border-ink/15 text-ink/70 bg-transparent">
                      {event.year} ARCHIVE
                    </span>
                    <span className="px-2.5 py-1 border border-brand/30 text-brand bg-transparent">
                      KEYNOTE EXHIBITION
                    </span>
                  </div>
                </div>
              </div>

              {/* ── 3. Special Dignitary Feature: Big Guest Image (Fully Showing, No BG) & Dignitary Dossier ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16 sm:mb-20 pt-8 border-t border-ink/10">
                {/* Guest of Honor Dossier */}
                <div
                  className={`w-full lg:col-span-5 flex flex-col justify-center space-y-4 ${
                    isReversed ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-ink/15 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
                      <span className="label-mono text-xs font-bold text-brand uppercase tracking-wider">
                        Guest of Honor
                      </span>
                    </div>
                    <span className="label-mono text-[10px] text-ink/60 font-semibold uppercase">
                      Special Dignitary
                    </span>
                  </div>

                  <div>
                    <h4 className="font-anton uppercase text-3xl sm:text-4xl text-ink leading-tight tracking-tight">
                      {event.guest.name}
                    </h4>
                    <p className="text-xs sm:text-sm font-semibold text-brand tracking-wider mt-1">
                      {event.guest.role}
                    </p>
                  </div>

                  {event.guest.citation && (
                    <p className="text-sm leading-relaxed text-ink/80 font-sans italic border-l-2 border-brand/40 pl-3.5">
                      &ldquo;{event.guest.citation}&rdquo;
                    </p>
                  )}

                  {/* Verification / Conformance Badge */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="font-mono text-xs text-ink/75 font-semibold">
                        Honored at {event.year} Conformance
                      </span>
                    </div>
                  </div>
                </div>

                {/* Big Guest Image with GSAP Expanding Effect */}
                <div
                  className={`w-full lg:col-span-7 flex justify-center items-center ${
                    isReversed ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <div
                    className="js-main-event-media w-full flex flex-col items-center justify-center bg-transparent"
                    data-side={isReversed ? "left" : "right"}
                  >
                    <div
                      onClick={(e) => {
                        openImageModal(e.currentTarget, {
                          src: event.guest.photo,
                          title: event.guest.name,
                          subtitle: event.guest.role,
                          category: "Special Dignitary & Chief Guest",
                          badge: "Guest of Honor",
                          description: event.guest.citation || event.guest.role,
                          meta: [
                            { label: "Guest of Honor", value: event.guest.name },
                            { label: "Designation", value: event.guest.role },
                            { label: "Occasion", value: event.tamil },
                            { label: "Year", value: event.year },
                          ],
                        })
                      }}
                      title={`Click to inspect profile: ${event.guest.name}`}
                      className="js-media-mask group relative w-full flex items-center justify-center cursor-pointer overflow-hidden bg-transparent"
                    >
                      <div className="js-media-inner will-change-transform w-full flex items-center justify-center bg-transparent py-2 sm:py-3">
                        <img
                          src={event.guest.photo}
                          alt={event.guest.name}
                          loading="lazy"
                          decoding="async"
                          className="w-auto h-auto max-h-[260px] sm:max-h-[340px] md:max-h-[400px] lg:max-h-[460px] max-w-full object-contain bg-transparent transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                        />
                      </div>
                    </div>

                    {/* Minimal Caption Under Guest Image */}
                    <div className="w-full flex items-center justify-between pt-2.5 text-xs text-ink/65 font-mono">
                      <span className="truncate">{event.guest.name}</span>
                      <span className="text-brand font-semibold shrink-0 ml-2">GUEST OF HONOR</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 4. Codrops ConnectedGrid Demo 2 Gallery Items ── */}
              <div className="connected-grid">
                {event.gallery.map((item) => (
                  <figure
                    key={item.id}
                    className="grid__item"
                    style={{
                      ["--r" as string]: item.r,
                      ["--c" as string]: item.c,
                      ["--s" as string]: item.s,
                    }}
                  >
                    <div
                      className="grid__item-img"
                      onClick={(e) => {
                        openImageModal(e.currentTarget, {
                          src: item.src,
                          title: item.title,
                          subtitle: `${event.eyebrow} · ${item.year}`,
                          category: "Event Photographic Archive",
                          badge: `${item.year} Conformance`,
                          description: item.alt,
                          meta: [
                            { label: "Occasion", value: event.tamil },
                            { label: "Year", value: item.year },
                            {
                              label: "Grid Coordinates",
                              value: `Row ${item.r} · Column ${item.c} (Span ${item.s})`,
                            },
                          ],
                        })
                      }}
                      title={`Click to inspect ${item.title}`}
                    >
                      <div
                        className="grid__item-img-inner"
                        style={{ backgroundImage: `url(${item.src})` }}
                      />
                    </div>
                    <figcaption className="grid__item-caption">
                      <h3>{item.title}</h3>
                      <span>{item.year}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default MainEvent

