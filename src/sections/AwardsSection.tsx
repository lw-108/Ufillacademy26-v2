import { useRef, useState, useCallback, useMemo } from "react"
import { Calendar, MapPin, Award, Sparkles, Layers, UserCheck } from "lucide-react"
import { gsap, MQ, revealOnScroll, useScene } from "@/lib/gsap"
import { SectionHeading } from "@/components/SectionHeading"
import { useRepeatingImageModal } from "@/components/RepeatingImageTransitionModal"
import { cn } from "@/lib/utils"

/**
 * AwardsSection — Single Unified Editorial Exhibition (Codrops Effect 3 Layout)
 *
 * Light architectural aesthetic with:
 * - Crisp black typography (text-ink) and brand blue highlights (text-brand)
 * - Zero dark background, zero silver/white text, zero gradient corners
 * - 5 items unified into a single staggered exhibition:
 *   1. Top-Left: Wide landscape (2.1:1) — Grand Felicitation Stage
 *   2. Mid-Right: Portrait/tall (4:5, staggered down) — Muthubalaji M. (Founder & CEO)
 *   3. Bottom Center-Left: Medium (4:3, staggered down) — Official Award Conformance
 *   4. Mid-Right: Portrait/tall (4:5, staggered down) — Divyadharshini (Financial Director)
 *   5. Center-Left: Panoramic (16:9, staggered down) — Honorary Stage Address
 */

export interface UnifiedExhibitionItem {
  id: string
  num: string
  src: string
  alt: string
  title: string
  year: string
  role?: string
  award?: string
  tag: string
  category: "honoree" | "ceremony"
  badge: string
  desc: string
  aspectRatioClass: string
  containerPlacement: string
  angle: number
  delay: number
}

const UNIFIED_EXHIBITION: UnifiedExhibitionItem[] = [
  // ── ITEM 1: Top-Left (Wide Landscape 2.1:1) ──
  {
    id: "ceremony-stage",
    num: "01",
    src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80",
    alt: "Awards ceremony grand stage at Sirkali",
    title: "Grand Felicitation Stage",
    year: "2025",
    tag: "01 / CEREMONY KEYNOTE · SIRKALI",
    category: "ceremony",
    badge: "Jackhi Book of World Records",
    desc: "Keynote presentation and ceremonial gathering at Sirkali honoring grassroots pedagogical milestones and youth tech empowerment.",
    aspectRatioClass: "aspect-[2.1/1]",
    containerPlacement: "w-full lg:w-[50%] max-w-[640px] self-start",
    angle: 0,
    delay: 0.1,
  },
  // ── ITEM 2: Mid-Right (Portrait/Tall 4:5, Staggered Down) ──
  {
    id: "honoree-muthubalaji",
    num: "02",
    src: "https://res.cloudinary.com/qtoywhbg/image/upload/v1786797358/muthuna_no8seg.png",
    alt: "Muthubalaji M. - Founder & CEO",
    title: "Muthubalaji M.",
    year: "2025",
    role: "Founder & CEO",
    award: "Young Entrepreneur Award",
    tag: "02 / FOUNDER & CEO · EXECUTIVE HONOREE",
    category: "honoree",
    badge: "Young Entrepreneur Award",
    desc: "Conferred for pioneering pedagogical innovation and expanding hands-on robotics and tech literacy for youth across South India.",
    aspectRatioClass: "aspect-[4/5]",
    containerPlacement: "w-full sm:w-[85%] lg:w-[36%] max-w-[460px] self-end lg:mr-[4%]",
    angle: 90,
    delay: 0.2,
  },
  // ── ITEM 3: Bottom Center-Left (Medium Landscape 4:3, Staggered Down) ──
  {
    id: "ceremony-conformance",
    num: "03",
    src: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=80",
    alt: "Official Award Conformance",
    title: "Official Award Conformance",
    year: "2025",
    tag: "03 / NATIONAL ACCLAMATION · MEDAL CONFORMANCE",
    category: "ceremony",
    badge: "Jackhi Book of World Records",
    desc: "Leadership team receiving national acclaim and official conformance medals from Jackhi Book of World Records dignitaries.",
    aspectRatioClass: "aspect-[4/3]",
    containerPlacement: "w-full sm:w-[76%] lg:w-[32%] max-w-[420px] ml-0 sm:ml-8 lg:ml-[22%]",
    angle: 225,
    delay: 0.25,
  },
  // ── ITEM 4: Mid-Right (Portrait/Tall 4:5, Staggered Down) ──
  {
    id: "honoree-divyadharshini",
    num: "04",
    src: "https://res.cloudinary.com/qtoywhbg/image/upload/v1786797358/divya_xglapk.png",
    alt: "Divyadharshini - Financial Director",
    title: "Divyadharshini",
    year: "2025",
    role: "Financial Director",
    award: "Executive Leadership Award",
    tag: "04 / FINANCIAL DIRECTOR · EXECUTIVE HONOREE",
    category: "honoree",
    badge: "Executive Leadership Award",
    desc: "Honored for stellar institutional management, fiscal governance, and transformative leadership at U Fill Academy.",
    aspectRatioClass: "aspect-[4/5]",
    containerPlacement: "w-full sm:w-[85%] lg:w-[36%] max-w-[460px] self-end lg:mr-[6%]",
    angle: 135,
    delay: 0.2,
  },
  // ── ITEM 5: Center-Left (Panoramic 16:9, Staggered Down) ──
  {
    id: "ceremony-address",
    num: "05",
    src: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=80",
    alt: "Honorary Stage Address",
    title: "Honorary Stage Address",
    year: "2025",
    tag: "05 / ACADEMIC PARTNERS · CITATION CONVOCATION",
    category: "ceremony",
    badge: "Jackhi Book of World Records",
    desc: "Dignitaries, mentors, and academic partners celebrating the transformative educational reach of U Fill Academy.",
    aspectRatioClass: "aspect-[16/9]",
    containerPlacement: "w-full sm:w-[88%] lg:w-[46%] max-w-[580px] ml-0 sm:ml-4 lg:ml-[12%]",
    angle: 45,
    delay: 0.3,
  },
]

type FilterTab = "all" | "honorees" | "ceremony"

export function AwardsSection() {
  const root = useRef<HTMLElement>(null)
  const { openImageModal } = useRepeatingImageModal()
  const [filterTab, setFilterTab] = useState<FilterTab>("all")

  useScene(
    root,
    (mm) => {
      mm.add(MQ.motion, () => {
        const el = root.current
        if (!el) return
        revealOnScroll(el)

        const items = el.querySelectorAll<HTMLElement>(".js-award-item")
        items.forEach((item, index) => {
          const isLeftSide = index % 2 === 0
          const maskEl = item.querySelector<HTMLElement>(".js-award-mask")
          const innerEl = item.querySelector<HTMLElement>(".js-award-inner")
          const captionEl = item.querySelector<HTMLElement>(".js-award-caption")

          if (!maskEl || !innerEl) return

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
              end: "center 50%",
              scrub: 0.8,
            },
          })

          tl.fromTo(
            maskEl,
            {
              yPercent: -100,
              xPercent: isLeftSide ? 100 : -100,
            },
            {
              yPercent: 0,
              xPercent: 0,
            }
          ).fromTo(
            innerEl,
            {
              yPercent: 100,
              xPercent: isLeftSide ? -100 : 100,
              scale: 1.15,
            },
            {
              yPercent: 0,
              xPercent: 0,
              scale: 1,
            },
            0
          )

          if (captionEl) {
            tl.fromTo(
              captionEl,
              {
                yPercent: 40,
                opacity: 0,
              },
              {
                yPercent: 0,
                opacity: 1,
              },
              0.15
            )
          }
        })
      })

      mm.add(MQ.reduce, () => {
        const el = root.current
        if (!el) return
        const masks = el.querySelectorAll<HTMLElement>(".js-award-mask, .js-award-inner")
        masks.forEach((m) => gsap.set(m, { xPercent: 0, yPercent: 0, scale: 1 }))
        const captions = el.querySelectorAll<HTMLElement>(".js-award-caption")
        captions.forEach((c) => gsap.set(c, { opacity: 1, yPercent: 0 }))
      })
    },
    [filterTab]
  )

  const displayedItems = useMemo(() => {
    if (filterTab === "honorees") {
      return UNIFIED_EXHIBITION.filter((item) => item.category === "honoree")
    }
    if (filterTab === "ceremony") {
      return UNIFIED_EXHIBITION.filter((item) => item.category === "ceremony")
    }
    return UNIFIED_EXHIBITION
  }, [filterTab])

  const handleOpenItemModal = useCallback(
    (e: React.MouseEvent<HTMLElement>, item: UnifiedExhibitionItem) => {
      openImageModal(e.currentTarget, {
        src: item.src,
        alt: item.alt,
        title: item.title,
        subtitle: item.role ? `${item.award} · ${item.role}` : `${item.tag} · ${item.year}`,
        category: item.category === "honoree" ? "Executive Honoree" : "World Records Ceremony",
        badge: item.badge,
        description: item.desc,
        meta: [
          { label: "Title", value: item.title },
          { label: "Year", value: item.year },
          { label: "Category", value: item.category === "honoree" ? "Executive Recipient" : "Archival Conformance" },
          { label: "Conferred By", value: "Jackhi Book of World Records, Sirkali" },
        ],
      })
    },
    [openImageModal]
  )

  return (
    <section id="awards" ref={root} className="relative z-10 bg-transparent px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-16 sm:space-y-24">
        {/* ── Section Header ── */}
        <SectionHeading
          index="08"
          eyebrow="National Accolades & Leadership Honors"
          title={
            <>
              Honors &amp; <span className="text-brand">Prestigious Awards</span>
            </>
          }
        />

        {/* ── Official Accreditation & Citation Banner ── */}
        <div data-reveal className="border-y border-ink/15 py-10 sm:py-14">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16 lg:items-center">
            <div className="space-y-4 lg:col-span-8">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                <span className="label-mono text-xs text-brand font-bold uppercase tracking-wider">
                  Jackhi Book of World Records Citation
                </span>
              </div>
              <h3 className="font-anton uppercase text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-tight text-ink">
                Young Emperor &amp; <span className="text-brand">Young Entrepreneur</span> Awards 2025
              </h3>
              <p className="max-w-3xl text-base leading-relaxed text-ink/90 sm:text-lg">
                Conferred and celebrated by the prestigious{" "}
                <strong className="font-bold text-brand">Jackhi Book of World Records</strong> at Sirkali, in recognition
                of visionary entrepreneurship, pedagogical leadership, and transforming the technological
                learning landscape for young innovators through{" "}
                <strong className="font-bold text-brand">U Fill Academy</strong>.
              </p>
            </div>

            <div className="lg:col-span-4 lg:border-l lg:border-ink/15 lg:pl-10 space-y-5">
              <dl className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-0.5 text-brand shrink-0" aria-hidden />
                  <div>
                    <dt className="label-mono text-[10px] text-ink/75 uppercase font-semibold">Event Date</dt>
                    <dd className="font-bold text-ink">09 &amp; 20 November 2025</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 text-brand shrink-0" aria-hidden />
                  <div>
                    <dt className="label-mono text-[10px] text-ink/75 uppercase font-semibold">Venue &amp; Location</dt>
                    <dd className="font-bold text-ink">Sirkali, Tamil Nadu</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="h-4 w-4 mt-0.5 text-brand shrink-0" aria-hidden />
                  <div>
                    <dt className="label-mono text-[10px] text-ink/75 uppercase font-semibold">Accreditation</dt>
                    <dd className="font-bold text-brand">Jackhi Book of World Records</dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* ── UNIFIED EDITORIAL STAGGERED EXHIBITION (5 IMAGES) ── */}
        {/* Clean, editorial light layout with crisp black typography and brand blue highlights */}
        <div data-reveal className="relative border border-ink/15 bg-white/40 backdrop-blur-xs p-6 sm:p-10 md:p-14 lg:p-16 overflow-hidden">

          {/* ── Exhibition Header with Curator Filter Controls ── */}
          <div className="relative z-10 border-b border-ink/15 pb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                <span className="font-mono text-xs text-brand font-bold uppercase tracking-wider">
                  [EXHIBITION GALLERY · EFFECT 03 · 5 WORKS]
                </span>
              </div>
              <h4 className="font-anton uppercase text-2xl sm:text-3xl lg:text-4xl tracking-tight text-ink">
                Archival Moments &amp; <span className="text-brand">Leadership Honors</span>
              </h4>
              <p className="font-mono text-xs text-ink/80">
                Stochastic Dither Wavefront &middot; Asymmetrical Spatial Stagger &middot; <span className="text-brand font-semibold">Sirkali 2025</span>
              </p>
            </div>

            {/* Gallery Filter Switcher */}
            <div className="flex items-center gap-1.5 bg-white/80 p-1 border border-ink/15 shrink-0 self-start sm:self-end">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={cn(
                  "font-mono text-xs px-3.5 py-1.5 transition-all duration-300 flex items-center gap-1.5 border",
                  filterTab === "all"
                    ? "bg-brand/10 border-brand text-brand font-bold"
                    : "border-transparent text-ink hover:border-ink/20 hover:text-brand"
                )}
              >
                <Sparkles className="h-3 w-3" />
                All 5 Works
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("honorees")}
                className={cn(
                  "font-mono text-xs px-3.5 py-1.5 transition-all duration-300 flex items-center gap-1.5 border",
                  filterTab === "honorees"
                    ? "bg-brand/10 border-brand text-brand font-bold"
                    : "border-transparent text-ink hover:border-ink/20 hover:text-brand"
                )}
              >
                <UserCheck className="h-3 w-3" />
                Honorees (2)
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("ceremony")}
                className={cn(
                  "font-mono text-xs px-3.5 py-1.5 transition-all duration-300 flex items-center gap-1.5 border",
                  filterTab === "ceremony"
                    ? "bg-brand/10 border-brand text-brand font-bold"
                    : "border-transparent text-ink hover:border-ink/20 hover:text-brand"
                )}
              >
                <Layers className="h-3 w-3" />
                Ceremony (3)
              </button>
            </div>
          </div>

          {/* ── 5-FRAME ASYMMETRICAL EDITORIAL STAGGERED EXHIBITION ── */}
          {/*
              Sequence & Spatial Architecture:
              1. Top-Left: Wide Landscape (2.1:1, ~50% desktop width) — Grand Felicitation Stage
              2. Mid-Right: Portrait/Tall (4:5, ~36% desktop width, staggered down) — Muthubalaji M.
              3. Bottom Center-Left: Medium Landscape (4:3, ~32% desktop width, indented at 22%) — Official Conformance
              4. Mid-Right: Portrait/Tall (4:5, ~36% desktop width, staggered down) — Divyadharshini
              5. Center-Left: Panoramic (16:9, ~46% desktop width, indented at 12%) — Honorary Stage Address

              Captions:
              - Meticulously handled monospace Title + Year + Badge + Citation directly underneath each frame.
              - Crisp black text with brand blue accents. No silver or white text.
              - Clean expanding image effect matching MainEvent.tsx with smooth hover scale and click-to-expand.
          */}
          <div className="relative z-10 mt-12 sm:mt-20 w-full space-y-20 sm:space-y-28 lg:space-y-36">
            {displayedItems.map((item, index) => {
              const isReversed = index % 2 === 1
              const isPortrait = item.aspectRatioClass.includes("4/5")

              return (
                <article
                  key={item.id}
                  className="js-award-item grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center border-b border-ink/15 pb-16 sm:pb-24 last:border-b-0 last:pb-0"
                >
                  {/* Image Frame Column */}
                  <div
                    className={cn(
                      "w-full",
                      isPortrait ? "lg:col-span-5 flex justify-center" : "lg:col-span-7",
                      isReversed ? "lg:order-2" : "lg:order-1"
                    )}
                  >
                    <div
                      onClick={(e) => handleOpenItemModal(e, item)}
                      className={cn("w-full cursor-pointer", isPortrait ? "max-w-[440px]" : "")}
                      title={`Click to inspect ${item.title}`}
                    >
                      {/* Outer Stationary Crop Frame: Holds aspect ratio & layout bounds, clips the mask */}
                      <div
                        className={cn(
                          "relative w-full overflow-hidden bg-transparent select-none",
                          item.aspectRatioClass
                        )}
                      >
                        {/* Sliding Mask Layer */}
                        <div className="js-award-mask w-full h-full relative overflow-hidden will-change-transform">
                          {/* Counter-sliding Inner Content Layer */}
                          <div className="js-award-inner w-full h-full relative will-change-transform">
                            <img
                              src={item.src}
                              alt={item.alt}
                              loading="eager"
                              decoding="async"
                              className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
                            />
                          </div>
                        </div>

                        {/* Subtle Corner Index Badge */}
                        <span className="font-mono absolute top-2.5 left-2.5 z-10 border border-ink/20 bg-white/95 px-2 py-0.5 text-[10px] font-bold text-ink">
                          {item.num}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Narrative & Citation Column */}
                  <div
                    className={cn(
                      "js-award-caption flex flex-col justify-center space-y-4",
                      isPortrait ? "lg:col-span-7" : "lg:col-span-5",
                      isReversed ? "lg:order-1" : "lg:order-2"
                    )}
                  >
                    {/* Tag & Year Bar */}
                    <div className="flex items-center justify-between border-b border-ink/15 pb-2">
                      <span className="label-mono text-xs font-bold text-brand uppercase tracking-wider">
                        {item.tag}
                      </span>
                      <span className="font-mono text-xs text-ink/60 font-bold">
                        {item.year}
                      </span>
                    </div>

                    {/* Title & Badge */}
                    <div>
                      <h3 className="font-anton uppercase text-3xl sm:text-4xl lg:text-5xl text-ink leading-tight tracking-tight">
                        {item.title}
                      </h3>
                      {item.role ? (
                        <p className="text-xs sm:text-sm font-bold text-brand uppercase tracking-wider mt-1.5">
                          {item.award} &middot; {item.role}
                        </p>
                      ) : (
                        <p className="text-xs sm:text-sm font-bold text-brand uppercase tracking-wider mt-1.5">
                          {item.badge}
                        </p>
                      )}
                    </div>

                    {/* Description Paragraph */}
                    <p className="text-sm sm:text-base leading-relaxed text-ink/85 font-sans">
                      {item.desc}
                    </p>

                    {/* Official Footnote Verification */}
                    <div className="pt-2 flex items-center gap-2 text-xs font-mono text-ink/60">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                      <span>Official Conformance &middot; Jackhi Book of World Records Archive</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {/* ── Exhibition Pavilion Footer ── */}
          <div className="relative z-10 mt-16 pt-6 border-t border-ink/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <span className="font-mono text-[11px] text-ink font-medium">
              Official Award Exhibition &middot; Click any frame to inspect full citation
            </span>
            <span className="font-mono text-[11px] text-brand font-bold uppercase tracking-wider">
              U Fill Academy &middot; Jackhi Book of World Records 2025
            </span>
          </div>
        </div>

        {/* Section Base Footnote */}
        <p data-reveal className="label-mono text-center text-xs text-ink pt-2 border-t border-ink/15 font-medium">
          Official Award Presentation Ceremony &middot; <span className="text-brand font-bold">Jackhi Book of World Records, Sirkali</span>
        </p>
      </div>
    </section>
  )
}

export default AwardsSection
