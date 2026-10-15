import { useRef } from "react"
import { gsap, MQ, useScene } from "@/lib/gsap"
import { SectionHeading } from "@/components/SectionHeading"
import { useRepeatingImageModal } from "@/components/RepeatingImageTransitionModal"

/**
 * Sticky card stack (after codrops/StickySections, demo 2).
 *
 * Each step is a full-viewport panel that sticks to the top. While the NEXT
 * panel scrolls up over it, this one shrinks slightly and dims, so it reads
 * as sinking beneath the incoming card. The last panel never dims — nothing
 * ever covers it.
 *
 * This now pins on EVERY width, phones included — not just tablet+. Only the
 * viewport HEIGHT is gated: sticky requires the panel to fit inside one
 * screen, so a panel taller than the viewport would have its bottom
 * stranded off-screen while pinned. Below that height (short windows,
 * landscape phones) it falls back to an ordinary, un-pinned stacked list —
 * nothing is ever clipped, it just scrolls normally instead of pinning.
 * Reduced motion gets that same plain stack, with no scrub.
 *
 * To make every panel actually FIT a phone's height once pinned, the
 * 1-column layout (anything below `lg`) is deliberately more compact than
 * the 2-column desktop one: the photo becomes a fixed-height band instead
 * of a full aspect-ratio block, and the step number sits inline beside the
 * title instead of looming above it. Every size in between is driven by
 * `clamp()`, so type and spacing scale continuously with the viewport
 * instead of jumping at breakpoints.
 *
 * ScrollTrigger measures each panel once, so the shared layout watcher in
 * `lib/gsap` re-measures when fonts / images settle.
 */

interface Step {
  number: string
  title: string
  tagline: string
  desc: string
  image: string
}

const steps: Step[] = [
  {
    number: "01", title: "Learn", tagline: "Foundation First",
    desc: "Master the basics of AI, Robotics, and Programming through hands-on, interactive modules built around real hardware, not just slides. Small cohorts and guided labs mean every concept is reinforced the same day it's introduced, so foundations actually stick before you move on.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    number: "02", title: "Explore", tagline: "Uncover Potential",
    desc: "Investigate real-world problems, chase emerging tech trends, and tinker with hardware prototypes in an open lab setting. You'll benchmark ideas against actual constraints — cost, power, materials — so exploration turns into judgement about what's actually worth building.",
    image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    number: "03", title: "Design", tagline: "Architect Ideas",
    desc: "Sketch custom algorithms, 3D mechanical models, and circuit schematics built for real impact, iterating in CAD and simulation before a single part gets cut. Peer design reviews mirror how professional engineering teams actually critique and refine a concept.",
    image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    number: "04", title: "Build", tagline: "Construct & Code",
    desc: "Assemble robotic prototypes, wire up IoT sensors, and ship functional, production-ready code in our labs, working with the same tooling used in industry. You'll learn to debug hardware and software together, since real builds rarely fail in just one layer.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
  },
  {
    number: "05", title: "Test", tagline: "Evaluate & Debug",
    desc: "Evaluate performance, debug embedded systems, optimize for speed, and stress-test the boundaries of what you've built until it breaks — on purpose. That's where the real engineering lessons live, and where a prototype earns the right to be called reliable.",
    image: "https://img.magnific.com/premium-photo/app-developer-testing-mobile-app-multiple-devices-coding-software-testing-tools_964444-48542.jpg?semt=ais_test_b&w=740&q=80",
  },
  {
    number: "06", title: "Innovate", tagline: "Push Boundaries",
    desc: "Refine features for the real market, file research patents, and build breakthrough R&D solutions alongside mentors who've shipped products before. You'll learn to defend an idea with data, not just enthusiasm, and to iterate fast when the data disagrees with you.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    number: "07", title: "Lead", tagline: "Future Pioneers",
    desc: "Spearhead your own venture, present research at global summits, and inspire the next generation of engineers coming up behind you. This is where the framework hands off to you — from learner to the person other learners come to for answers.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
  },
]

// Unsplash accepts a `w=` width param — request a size close to the
// element's rendered width instead of always shipping the 1200px master.
const buildResponsiveSrc = (url: string, width: number) => url.replace(/w=\d+/, `w=${width}`)
const IMAGE_SIZES = "(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 640px"
const buildSrcSet = (url: string) =>
  [480, 768, 1200, 1600].map((w) => `${buildResponsiveSrc(url, w)} ${w}w`).join(", ")

/**
 * Sticky stack only when a full panel fits the viewport — width is no
 * longer part of the gate (the compact mobile layout below `lg` is sized to
 * fit), only height.
 *
 * This exact condition is ALSO spelled out, literally, as a Tailwind
 * arbitrary-variant media query on each panel's `sticky` / `top-0` /
 * `min-h-screen` classes below (search `@media(min-height:600px)`). Tailwind
 * scans source text for class names, so that query can't be built from this
 * JS string — it has to be written out in the className itself. If the two
 * ever disagree, JS pins a panel the CSS never made sticky, or the reverse,
 * and the stack breaks. Keep them matching.
 */
const STACK_QUERY = `(min-height: 600px) and ${MQ.motion}`

export function FrameworkSection() {
  const root = useRef<HTMLElement>(null)
  const { openImageModal } = useRepeatingImageModal()

  useScene(root, (mm) => {
    mm.add({ stack: STACK_QUERY, motion: MQ.motion }, (ctx) => {
      const { stack, motion } = ctx.conditions as Record<string, boolean>
      if (!motion) return

      if (!stack) return
      const el = root.current!
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", el)

      panels.forEach((panel, i) => {
        const isLast = i === panels.length - 1

        // Dim + shrink while the next panel covers this one.
        // Uses GPU-accelerated opacity overlay instead of CSS filter: brightness()
        // which forces CPU rasterization and repaint across the entire page.
        if (!isLast) {
          gsap.fromTo(
            panel,
            { scale: 1 },
            {
              scale: 0.94,
              transformOrigin: "50% 0%",
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                start: "top top",
                end: "+=100%",
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          )

          const dim = panel.querySelector<HTMLElement>("[data-dim]")
          if (dim) {
            gsap.fromTo(
              dim,
              { opacity: 0 },
              {
                opacity: 0.25,
                ease: "none",
                scrollTrigger: {
                  trigger: panel,
                  start: "top top",
                  end: "+=100%",
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              }
            )
          }
        }

        // Image drifts inside its frame as the panel travels past.
        const img = panel.querySelector<HTMLElement>("[data-parallax]")
        if (img) {
          gsap.fromTo(
            img,
            { yPercent: -7, scale: 1.12 },
            {
              yPercent: 7,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          )
        }
      })
    })
  })

  return (
    <section ref={root} id="framework" className="relative bg-transparent">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-32 lg:px-8">
        <SectionHeading
          index="05"
          eyebrow="7-Level Learning Adventure"
          title={
            <>
              Our Learning <span className="text-brand">Framework</span>
            </>
          }
          lead="Seven levels, seven full-screen stops — a hands-on pipeline that turns curious learners into technology pioneers."
        />
      </div>

      {/* Sticky stack */}
      <div className="relative">
        {steps.map((step, index) => (
          <article
            key={step.number}
            data-panel
            aria-label={`Level ${step.number}: ${step.title}`}
            className="relative flex w-full items-center border-t border-ink bg-white [@media(min-height:600px)_and_(prefers-reduced-motion:no-preference)]:sticky [@media(min-height:600px)_and_(prefers-reduced-motion:no-preference)]:top-0 [@media(min-height:600px)_and_(prefers-reduced-motion:no-preference)]:min-h-screen"
            style={{
              zIndex: index + 1,
              // Only the sticky stack needs the lift shadow to separate panels.
              boxShadow: "0 -24px 48px -24px rgba(0,0,0,0.12)",
            }}
          >
            <div data-dim aria-hidden className="pointer-events-none absolute inset-0 z-30 bg-black opacity-0 will-change-opacity" />
            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 md:py-12 lg:px-8 lg:py-20">
              <div className="grid grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-16">
                {/* Text — order-2 on mobile/tablet (the photo banner leads), order-1 at lg+
                    where it sits in its own column beside a full-size image instead. */}
                <div className="order-2 space-y-3 sm:space-y-4 lg:order-1 lg:col-span-6 lg:space-y-6">
                  <div className="flex items-end justify-between gap-4">
                    {/* Full-size number, desktop only */}
                    <div className="hidden items-baseline gap-3 lg:flex">
                      <span className="font-anton text-[clamp(5rem,12vw,10rem)] leading-[0.8] tracking-tight text-brand">
                        {step.number}
                      </span>
                    </div>
                    <span className="label-mono border border-ink px-2.5 py-1.5 text-ink sm:px-3 sm:py-2 ml-auto lg:ml-0">
                      {step.tagline}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2.5 sm:gap-3 lg:block">
                    <span className="font-anton text-[clamp(1.75rem,9vw,3rem)] leading-[0.85] tracking-tight text-brand lg:hidden">
                      {step.number}
                    </span>
                    <h3 className="font-anton uppercase text-[clamp(2rem,9vw,7rem)] leading-[0.92] tracking-tight text-ink">
                      {step.title}
                    </h3>
                  </div>

                  <p className="max-w-xl text-[clamp(0.9375rem,2.2vw,1.125rem)] font-medium leading-relaxed text-mute">
                    {step.desc}
                  </p>

                  <div className="flex gap-1.5 pt-1 lg:pt-2" aria-hidden>
                    {steps.map((s, i) => (
                      <span
                        key={s.number}
                        className={`h-1.5 w-6 ${i === index ? "bg-ink" : "bg-ink/15"}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Image — a compact fixed-height banner below `lg` (so a whole panel
                    reliably fits one screen once it pins), a full aspect-ratio block
                    in its own column at `lg`+. */}
                <div className="order-1 lg:order-2 lg:col-span-6">
                  <div
                    onClick={(e) => {
                      openImageModal(e.currentTarget, {
                        src: step.image,
                        alt: `${step.title} — level ${step.number}`,
                        title: `${step.number} · ${step.title}`,
                        subtitle: `${step.tagline} · Level ${step.number}`,
                        category: "Pedagogical Framework",
                        badge: step.tagline,
                        description: step.desc,
                        meta: [
                          { label: "Level", value: step.number },
                          { label: "Phase", value: step.tagline },
                          { label: "Curriculum", value: "U Fill Academy Pedagogical Framework" },
                        ],
                      })
                    }}
                    title={`Click to inspect framework level: ${step.title}`}
                    className="group crop-marks relative h-32 w-full overflow-hidden border border-ink bg-neutral-100 sm:h-44 md:h-56 lg:aspect-[4/3] lg:h-auto cursor-pointer hover:border-brand transition-colors duration-300"
                  >
                    <img
                      data-parallax
                      src={step.image}
                      srcSet={buildSrcSet(step.image)}
                      sizes={IMAGE_SIZES}
                      alt={`${step.title} — level ${step.number}`}
                      width={1200}
                      height={900}
                      className="absolute inset-0 h-full w-full object-cover grayscale transition-[filter,transform] duration-700 group-hover:grayscale-0 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default FrameworkSection
