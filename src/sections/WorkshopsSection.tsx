import { useRef } from "react"
import { Building2, Calendar, Clock, GraduationCap, Mic2 } from "lucide-react"
import { gsap, MQ, useScene } from "@/lib/gsap"
import { SectionHeading } from "@/components/SectionHeading"
import { useRepeatingImageModal } from "@/components/RepeatingImageTransitionModal"
import { cn } from "@/lib/utils"

/**
 * WorkshopsSection — Redesigned into Atelier's "Selected Works" asymmetric editorial style.
 *
 * Features:
 * - Restored original title: "Lean Start-up & Robotics in Agriculture" with SectionHeading
 * - Mirrored / opposite staggered 12-column grid placement (opposite of Atelier's original)
 * - Authentic BIG pixelized image reveal effect (using Atelier's 10px-downsampled canvas algorithm)
 * - GSAP slow-scroll parallax: image containers scroll visibly slower than other elements
 * - Full preservation of authentic workshop images, descriptions, and RepeatingImageTransitionModal
 */

interface WorkshopPhoto {
  number: string
  src: string
  alt: string
  title: string
  location: string
  desc: string
  aspectClass: string
  gridPlacement: string
}

const WORKSHOP_PHOTOS: WorkshopPhoto[] = [
  {
    number: "01",
    src: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    alt: "Mentors addressing the student cohort",
    title: "Mentorship Keynote Address",
    location: "The Kavery Eng College",
    desc: "U Fill Academy leadership delivering technical mentorship and ideation frameworks to eager engineering students.",
    aspectClass: "aspect-[16/11]",
    // Opposite placing: Card 1 sits on the RIGHT (col 8-12)
    gridPlacement:
      "col-span-12 sm:col-span-11 sm:col-start-2 lg:col-span-5 lg:col-start-8 lg:row-start-1",
  },
  {
    number: "02",
    src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80",
    alt: "Keynote speaker presenting to the hall",
    title: "Lean MVP Presentation",
    location: "APJ Hall · Salem",
    desc: "Explaining minimum viable product development, iterative validation, and technology commercialization.",
    aspectClass: "aspect-[4/3]",
    // Opposite placing: Card 2 sits on the LEFT (col 1-4) with top offset
    gridPlacement:
      "col-span-12 sm:col-span-10 sm:col-start-1 lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:mt-48",
  },
  {
    number: "03",
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    alt: "U Fill Academy team with college dignitaries",
    title: "Leadership & Dignitaries Felicitation",
    location: "Faculty Partnership",
    desc: "Collaborative partnership between U Fill Academy leadership and the Kavery Engineering College faculty.",
    aspectClass: "aspect-[4/3]",
    // Opposite placing: Card 3 sits on the LEFT (col 2-5)
    gridPlacement:
      "col-span-12 sm:col-span-10 sm:col-start-1 lg:col-span-4 lg:col-start-2 lg:row-start-2",
  },
  {
    number: "04",
    src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
    alt: "Students engaged in group discussion",
    title: "Group Ideation & Problem Solving",
    location: "Student Innovation Cohorts",
    desc: "Interactive cohort brainstorming real-world agricultural engineering automation use-cases.",
    aspectClass: "aspect-[4/3]",
    // Opposite placing: Card 4 sits on the RIGHT (col 9-12) with self-end
    gridPlacement:
      "col-span-12 sm:col-span-11 sm:col-start-2 lg:col-span-4 lg:col-start-9 lg:row-start-2 lg:self-end",
  },
  {
    number: "05",
    src: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80",
    alt: "Audience listening at APJ Hall",
    title: "APJ Hall Engineering Audience",
    location: "200+ Engineering Delegates",
    desc: "Over 200 aspiring engineers participating actively during the technical keynote at APJ Hall.",
    aspectClass: "aspect-[16/10]",
    // Opposite placing: Card 5 sits on the LEFT (col 1-6) with top offset
    gridPlacement:
      "col-span-12 sm:col-span-11 sm:col-start-1 lg:col-span-6 lg:col-start-1 lg:row-start-3 lg:mt-48",
  },
  {
    number: "06",
    src: "https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=1200&q=80",
    alt: "Lean Start-up and MVP boot camp session in progress",
    title: "Hands-on MVP Boot Camp",
    location: "Prototype Sprint",
    desc: "Practical sprint sessions helping student teams turn preliminary project concepts into tangible MVPs.",
    aspectClass: "aspect-[16/11]",
    // Card 6 sits on the RIGHT (col 8-12)
    gridPlacement:
      "col-span-12 sm:col-span-11 sm:col-start-2 lg:col-span-5 lg:col-start-8 lg:row-start-3",
  },
]

const INSTITUTIONAL_META = [
  {
    icon: Building2,
    tag: "[01 / INSTITUTION]",
    title: "The Kavery Engineering College",
    sub: "Autonomous · Mecheri, Salem",
  },
  {
    icon: GraduationCap,
    tag: "[02 / DEPARTMENT]",
    title: "Agricultural Eng & ISTE",
    sub: "In association with IIC-TKEC",
  },
  {
    icon: Calendar,
    tag: "[03 / SCHEDULE]",
    title: "19 August 2026 · Wednesday",
    sub: "10:30 AM Technical Session",
  },
  {
    icon: Clock,
    tag: "[04 / VENUE]",
    title: "APJ Hall, Salem Campus",
    sub: "Main Auditorium & Lab Facilities",
  },
]



export function WorkshopsSection() {
  const root = useRef<HTMLElement>(null)
  const { openImageModal } = useRepeatingImageModal()

  useScene(root, (mm) => {
    mm.add(MQ.motion, () => {
      const el = root.current!

      // Codrops ConnectedGrid / MainEvent dual-axis sliding-mask expanding GSAP effect
      const cards = el.querySelectorAll<HTMLElement>(".js-workshop-card")
      cards.forEach((card, index) => {
        const isLeftSide = index % 2 === 0
        const maskEl = card.querySelector<HTMLElement>(".js-workshop-mask")
        const innerEl = card.querySelector<HTMLElement>(".js-workshop-inner")
        const captionEl = card.querySelector<HTMLElement>(".js-workshop-caption")

        if (!maskEl || !innerEl) return

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: card,
            start: "top bottom-=15%",
            end: "+=50%",
            scrub: true,
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
          },
          {
            yPercent: 0,
            xPercent: 0,
          },
          0
        )

        if (captionEl) {
          tl.fromTo(
            captionEl,
            { yPercent: 40, opacity: 0 },
            { yPercent: 0, opacity: 1 },
            0
          )
        }
      })

      // Metadata strip entrance
      const metaStrip = el.querySelector<HTMLElement>("[data-meta-strip]")
      if (metaStrip) {
        gsap.from(metaStrip, {
          autoAlpha: 0,
          y: 24,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: metaStrip,
            start: "top 88%",
            once: true,
          },
        })
      }
    })
  })

  return (
    <section
      id="workshops"
      ref={root}
      className="relative z-10 bg-transparent px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* ============================================================ */}
        {/* SECTION HEADING (Restored Original Title & Eyebrow)         */}
        {/* ============================================================ */}
        <SectionHeading
          index="09"
          eyebrow="Recent Workshop & Academic Exposure"
          title={
            <>
              Lean Start-up &amp; <span className="text-brand">Robotics in Agriculture</span>
            </>
          }
          lead="U Fill Academy's comprehensive workshop session at The Kavery Engineering College (Autonomous), Mecheri, Salem, empowering students with Lean Start-up frameworks, MVP validation, project mentoring, and practical applications of Robotics in Agricultural Engineering."
        />

        {/* ============================================================ */}
        {/* INSTITUTIONAL METADATA STRIP (Atelier Bordered Grid Style)   */}
        {/* ============================================================ */}
        <div data-meta-strip className="my-8 sm:my-14">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-ink/20 divide-y sm:divide-y-0 divide-ink/20">
            {INSTITUTIONAL_META.map((meta, i) => {
              const Icon = meta.icon
              return (
                <li
                  key={meta.tag}
                  className={`p-4 sm:p-5 flex flex-col justify-between ${
                    i > 0 ? "sm:border-l border-ink/20" : ""
                  } ${i >= 2 ? "sm:border-t lg:border-t-0 border-ink/20" : ""}`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-ink/50 uppercase tracking-wider">
                    <span>{meta.tag}</span>
                    <Icon className="h-3.5 w-3.5 text-brand" aria-hidden />
                  </div>
                  <div className="mt-3 sm:mt-4">
                    <p className="text-sm sm:text-base font-semibold text-ink leading-snug">
                      {meta.title}
                    </p>
                    <p className="text-xs text-mute font-mono mt-1">{meta.sub}</p>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Keynote Highlight Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 border-x border-b border-ink/20 px-4 py-3.5 sm:px-6 text-xs sm:text-sm font-mono text-ink/80">
            <div className="flex items-center gap-2 shrink-0 text-brand font-bold">
              <Mic2 className="h-4 w-4" aria-hidden />
              <span>[KEYNOTE MENTORS]</span>
            </div>
            <p className="leading-relaxed">
              Led by <strong className="font-semibold text-ink">Mr. M. Muthubalaji</strong> (Founder
              &amp; CEO) and <strong className="font-semibold text-ink">Mr. S. Hari Krishnan</strong>{" "}
              (Deputy Managing Director), featuring interactive MVP prototyping with 200+ students.
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* ASYMMETRIC 12-COLUMN GRID (OPPOSITE PLACEMENT OF ATELIER)    */}
        {/* ============================================================ */}
        <div className="grid grid-cols-12 gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-16 sm:gap-y-24 lg:gap-y-36 lg:grid-rows-[repeat(3,auto)]">
          {WORKSHOP_PHOTOS.map((photo) => (
            <article
              key={photo.number}
              className={cn("js-workshop-card group flex flex-col gap-3 sm:gap-4", photo.gridPlacement)}
            >
              {/* Top mono numbering & location tag (scrolls normally with page) */}
              <div className="flex items-center justify-between text-xs sm:text-sm font-mono tracking-wider text-ink/70">
                <span className="font-semibold">({photo.number})</span>
                <span className="text-[11px] uppercase tracking-wider text-brand font-medium">
                  {photo.location}
                </span>
              </div>

              {/* Expanding image container matching MainEvent.tsx */}
              <div className="my-1">
                <div
                  onClick={(e) =>
                    openImageModal(e.currentTarget, {
                      src: photo.src,
                      alt: photo.alt,
                      title: photo.title,
                      subtitle: photo.location,
                      category: "Academic Workshop Coverage",
                      badge: "The Kavery Engineering College",
                      description: photo.desc,
                      meta: [
                        { label: "Institution", value: "The Kavery Engineering College" },
                        { label: "Date", value: "19 August 2026 · Wednesday" },
                        { label: "Department", value: "Agricultural Eng & ISTE" },
                        { label: "Venue", value: "APJ Hall, Mecheri, Salem" },
                      ],
                    })
                  }
                  className={cn(
                    "js-workshop-mask relative overflow-hidden bg-transparent cursor-pointer",
                    photo.aspectClass
                  )}
                >
                  <div className="js-workshop-inner will-change-transform w-full h-full">
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                    />
                  </div>
                </div>
              </div>

              {/* Card info: Title and genuine workshop description (scrolls normally) */}
              <div className="js-workshop-caption space-y-1.5 pt-1">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-anton uppercase text-lg sm:text-xl lg:text-2xl font-normal tracking-wide text-ink group-hover:text-brand transition-colors duration-300">
                    {photo.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-mute font-sans">
                  {photo.desc}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* ============================================================ */}
        {/* SECTION FOOTER                                              */}
        {/* ============================================================ */}
        <div className="mt-20 sm:mt-32 pt-8 sm:pt-12 border-t border-ink/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-ink/60">
          <p>OFFICIAL EVENT COVERAGE &middot; THE KAVERY ENGINEERING COLLEGE, SALEM</p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
            <span>INNOVATION COUNCIL (IIC-TKEC) &amp; ISTE ACCREDITED</span>
          </p>
        </div>
      </div>
    </section>
  )
}

export default WorkshopsSection
