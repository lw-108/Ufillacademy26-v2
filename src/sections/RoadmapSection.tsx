import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import { gsap, MQ, revealOnScroll, useScene } from "@/lib/gsap"
import { useMediaQuery } from "@/lib/use-media-query"
import { SectionHeading } from "@/components/SectionHeading"
import { useRepeatingImageModal } from "@/components/RepeatingImageTransitionModal"

interface Milestone {
  id: string
  year: string
  title: string
  desc: string
  image: string
  before: string
  keyword: string
  after: string
}

const ROADMAP: Milestone[] = [
  {
    id: "expansion",
    year: "2026",
    title: "Expansion of U Fill Academy",
    desc: "Scaling practical learning hubs, R&D projects, and student tech bootcamps across South India.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1400&q=80",
    before: "Scaling our",
    keyword: "reach",
    after: "across the nation.",
  },
  {
    id: "partnerships",
    year: "2027",
    title: "Institutional Partnerships",
    desc: "Collaborating directly with schools, polytechnics, and engineering colleges across Tamil Nadu.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1400&q=80",
    before: "Building bridges,",
    keyword: "together.",
    after: "",
  },
  {
    id: "labs",
    year: "2028",
    title: "Advanced Research Labs",
    desc: "Establishing state-of-the-art AI, Robotics, and IoT prototyping laboratories.",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1400&q=80",
    before: "Where ideas",
    keyword: "ignite",
    after: "the future.",
  },
  {
    id: "edtech",
    year: "2029",
    title: "EdTech Innovation",
    desc: "Developing proprietary adaptive learning platforms, simulation kits, and digital tools.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1400&q=80",
    before: "Reimagining how",
    keyword: "learning",
    after: "feels.",
  },
  {
    id: "global",
    year: "2030",
    title: "Global Technological Ecosystem",
    desc: "Transforming into a globally recognized educational and technological organization.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&q=80",
    before: "A world-class",
    keyword: "ecosystem",
    after: "born here.",
  },
]

/** Three columns (copy | image | copy) need real width: laptop and up. */
const SCROLLY_QUERY = `(min-width: 1024px) and ${MQ.motion}`

const N = ROADMAP.length

function MilestoneCopy({ item, index }: { item: Milestone; index: number }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="font-anton text-6xl leading-none tracking-tight text-brand lg:text-7xl">
          {item.year}
        </span>
        {index === 0 && (
          <span className="label-mono bg-ink px-2.5 py-2 text-[10px] text-white">Current Horizon</span>
        )}
      </div>
      <h3 className="font-anton uppercase text-3xl leading-[1.05] tracking-tight text-ink lg:text-4xl">
        {item.before} <span className="text-brand">{item.keyword}</span> {item.after}
      </h3>
      <div className="space-y-2 border-t border-ink pt-4">
        <h4 className="text-sm font-semibold text-ink">{item.title}</h4>
        <p className="text-sm leading-relaxed text-mute">{item.desc}</p>
      </div>
      <a
        href="#contact"
        className="label-mono group inline-flex h-11 items-center gap-2 bg-ink px-5 text-white transition-colors duration-300 hover:bg-brand"
      >
        Explore Milestone
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </a>
    </div>
  )
}

export function RoadmapSection() {
  const root = useRef<HTMLElement>(null)
  const { openImageModal } = useRepeatingImageModal()
  // Sticky image + scrubbed wipes need a tablet+ screen with motion allowed.
  const scrolly = useMediaQuery(SCROLLY_QUERY)

  useScene(
    root,
    (mm) => {
      mm.add({ full: SCROLLY_QUERY, motion: MQ.motion }, (ctx) => {
        const { full, motion } = ctx.conditions as Record<string, boolean>
        if (!motion) return
        const el = root.current!
        revealOnScroll(el)
        if (!full) return

        const track = el.querySelector<HTMLElement>("[data-track]")!
        const wrappers = gsap.utils.toArray<HTMLElement>("[data-wrap]", el)
        const imgs = gsap.utils.toArray<HTMLElement>("[data-img]", el)

        // The image column is `position: sticky` (native, jitter-free), so
        // the only job of ScrollTrigger here is to scrub the wipes across
        // the track's scroll distance. Track = N viewports tall → the
        // scrubbed range is exactly N-1 viewport-heights, one per step.
        gsap.set(imgs, { scale: 1.14 })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
          defaults: { ease: "none" },
        })

        for (let k = 0; k < N - 1; k++) {
          const at = k + 0.12
          tl.addLabel(`step-${k}`, k)
            // Current image is wiped upward, revealing the next beneath it…
            .fromTo(
              wrappers[k],
              { clipPath: "inset(0% 0% 0% 0%)" },
              { clipPath: "inset(0% 0% 100% 0%)", duration: 0.76, ease: "power1.inOut" },
              at
            )
            // …while both drift for depth.
            .fromTo(imgs[k], { yPercent: 0 }, { yPercent: -7, duration: 0.76 }, at)
            .fromTo(imgs[k + 1], { yPercent: 7 }, { yPercent: 0, duration: 0.76 }, at)
        }
        tl.addLabel(`step-${N - 1}`, N - 1)

        // Each text block eases in as it nears the viewport centre and out
        // as it leaves — symmetrical, scrubbed, and never left invisible.
        gsap.utils.toArray<HTMLElement>("[data-copy]", el).forEach((copy) => {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: copy,
                start: "top 90%",
                end: "bottom 10%",
                scrub: true,
              },
              defaults: { ease: "none" },
            })
            .fromTo(copy, { autoAlpha: 0.15, y: 36 }, { autoAlpha: 1, y: 0, duration: 1 })
            .to(copy, { autoAlpha: 0.15, y: -36, duration: 1 }, 1.4)
        })
      })
    },
    [scrolly]
  )

  return (
    <section id="roadmap" ref={root} className="relative bg-transparent">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6 sm:pb-12 sm:pt-32 lg:px-8">
        <SectionHeading
          index="14"
          eyebrow="Future Horizons"
          title={
            <>
              Strategic Growth <span className="text-brand">Roadmap</span>
            </>
          }
          lead="Strategic milestones leading to global technological leadership by 2030."
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {scrolly ? (
          <div
            data-track
            className="relative grid grid-cols-12 gap-8"
            style={{ height: `${N * 100}svh` }}
          >
            {/* Left copy: milestones 1, 3, 5 */}
            <div className="col-span-3 flex flex-col">
              {ROADMAP.map((item, i) =>
                i % 2 === 0 ? (
                  <div key={item.id} className="flex h-[100svh] items-center">
                    <div data-copy>
                      <MilestoneCopy item={item} index={i} />
                    </div>
                  </div>
                ) : (
                  <div key={item.id} className="h-[100svh]" aria-hidden />
                )
              )}
            </div>

            {/* Centre: sticky image stack */}
            <div className="relative col-span-6">
              <div className="sticky top-0 flex h-[100svh] items-center">
                <div className="crop-marks relative h-[min(64svh,600px)] w-full border border-ink bg-neutral-100">
                  <div className="absolute inset-0 overflow-hidden">
                    {ROADMAP.map((item, i) => (
                      <div
                        key={item.id}
                        data-wrap
                        className="absolute inset-0 overflow-hidden cursor-pointer group"
                        style={{ zIndex: N - i }}
                        onClick={(e) => {
                          openImageModal(e.currentTarget, {
                            src: item.image,
                            alt: item.title,
                            title: `${item.year} — ${item.title}`,
                            subtitle: `${item.before} ${item.keyword} ${item.after}`.trim(),
                            category: "Strategic Growth Roadmap",
                            badge: `Horizon ${item.year}`,
                            description: item.desc,
                            meta: [
                              { label: "Target Year", value: item.year },
                              { label: "Milestone", value: item.title },
                              { label: "Vision", value: item.desc },
                            ],
                          })
                        }}
                        title={`Click to inspect milestone: ${item.title}`}
                      >
                        <img
                          data-img
                          src={item.image}
                          alt={item.title}
                          width={1400}
                          height={900}
                          loading="lazy"
                          className="h-full w-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <p className="absolute bottom-5 left-5 right-5 font-anton uppercase text-2xl leading-tight text-white lg:text-3xl">
                          {item.year} — {item.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right copy: milestones 2, 4 */}
            <div className="col-span-3 flex flex-col">
              {ROADMAP.map((item, i) =>
                i % 2 === 1 ? (
                  <div key={item.id} className="flex h-[100svh] items-center">
                    <div data-copy>
                      <MilestoneCopy item={item} index={i} />
                    </div>
                  </div>
                ) : (
                  <div key={item.id} className="h-[100svh]" aria-hidden />
                )
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-14 pb-16">
            {ROADMAP.map((item, i) => (
              <article key={item.id} data-reveal className="space-y-6 border-t border-ink pt-6">
                <div
                  className="crop-marks relative aspect-[4/3] w-full overflow-hidden border border-ink bg-neutral-100 sm:aspect-[16/9] cursor-pointer group"
                  onClick={(e) => {
                    openImageModal(e.currentTarget, {
                      src: item.image,
                      alt: item.title,
                      title: `${item.year} — ${item.title}`,
                      subtitle: `${item.before} ${item.keyword} ${item.after}`.trim(),
                      category: "Strategic Growth Roadmap",
                      badge: `Horizon ${item.year}`,
                      description: item.desc,
                      meta: [
                        { label: "Target Year", value: item.year },
                        { label: "Milestone", value: item.title },
                        { label: "Vision", value: item.desc },
                      ],
                    })
                  }}
                  title={`Click to inspect milestone: ${item.title}`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    width={1400}
                    height={900}
                    loading="lazy"
                    className="h-full w-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <MilestoneCopy item={item} index={i} />
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default RoadmapSection
