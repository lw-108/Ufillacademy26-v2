import { useRef } from "react"
import { Bot, Brain, Cpu, Lightbulb, Users, Zap, type LucideIcon } from "lucide-react"
import { gsap, MQ, useScene } from "@/lib/gsap"
import { useRepeatingImageModal } from "@/components/RepeatingImageTransitionModal"
import { cn } from "@/lib/utils"

/**
 * ActivitiesSection — Atelier "OUR TEAM" style with U Fill Brand Blue & Pure White Cards.
 *
 * Specific requirements implemented:
 * - Brand blue background (#0026FF / @ufill brand blue) replaces the black background completely.
 * - Flying cards have a pure WHITE background (#FFFFFF, not blue).
 * - Card heading titles are in U Fill BRAND BLUE (#0026FF).
 * - All other card texts (tags, description, numbers, labels) are strictly in BLACK (#000000).
 * - Title scrolls up and fixes in place first with letter reveal before the first card enters.
 * - The first card only becomes visible after the section title is fully set and fixed.
 * - Cards fly ONE BY ONE: isolated sequentially across the scroll track,
 *   never in a parallel formation of two cards at once.
 * - Top and bottom scrubbed pixel transition backgrounds are transparent,
 *   with animated filling pixels strictly in the U Fill brand blue (#0026FF)
 *   (no black, golden, or white accent colors).
 */

interface Activity {
  icon: LucideIcon
  tag: string
  title: string
  desc: string
  image: string
}

const ACTIVITIES: Activity[] = [
  {
    icon: Bot,
    tag: "Robotics & IoT",
    title: "Quadruped Robot Testing",
    desc: "Hands-on wireless control, kinematics calibration, and locomotion testing using specialized smart robotics kits.",
    image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: Zap,
    tag: "Hands-on Hardware",
    title: "Circuit Wiring & Design",
    desc: "Students collaboratively assembling breadboard components, understanding polarity, resistors, and DC power routing.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: Brain,
    tag: "Strategic Thinking",
    title: "Chess & Cognitive Focus",
    desc: "Building logic, problem-solving, and deep concentration through structured chess training at Alspire Academy.",
    image: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: Cpu,
    tag: "Electronics Lab",
    title: "Component Integration",
    desc: "Step-by-step practical integration of electronic sensors, jumper wires, and breadboard circuit debugging.",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: Lightbulb,
    tag: "Project Output",
    title: "Live LED Prototyping",
    desc: "Proudly demonstrating an independently built electronic circuit board with functioning LED output and power supply.",
    image: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: Users,
    tag: "Team Collaboration",
    title: "Group Practical Learning",
    desc: "Fostering peer teamwork, shared ideation, and collaborative problem-solving across all practical training modules.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  },
]

export function ActivitiesSection() {
  const root = useRef<HTMLElement>(null)
  const topPixelRef = useRef<HTMLDivElement>(null)
  const bottomPixelRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const { openImageModal } = useRepeatingImageModal()

  useScene(root, (mm) => {
    mm.add(MQ.motion, () => {
      // 1. Top Pixel Transition (transparent -> strictly U Fill brand blue #0026FF)
      // 1. Top Pixel Transition (GPU-composited opacity animation)
      const topWrapper = topPixelRef.current
      if (topWrapper) {
        topWrapper.innerHTML = ""
        const cols = 25
        const rows = 6
        const brandBlue = "#0026FF"
        const probabilities = [0.1, 0.2, 0.5, 0.7, 1, 1]
        const targetCells: HTMLElement[] = []

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cell = document.createElement("div")
            cell.className = "w-full h-full will-change-opacity"
            cell.style.backgroundColor = brandBlue
            cell.style.opacity = "0"
            cell.style.margin = "0 -1px -1px 0"

            if (Math.random() < probabilities[r]) {
              targetCells.push(cell)
            }
            topWrapper.appendChild(cell)
          }
        }

        gsap.to(targetCells, {
          opacity: 1,
          duration: 0.05,
          stagger: {
            each: 0.003,
            from: "random",
          },
          ease: "none",
          scrollTrigger: {
            trigger: topWrapper,
            start: "top bottom",
            end: "top 20%",
            scrub: true,
          },
        })
      }

      // 2. Bottom Pixel Leave Transition (GPU-composited opacity animation)
      const bottomWrapper = bottomPixelRef.current
      if (bottomWrapper) {
        bottomWrapper.innerHTML = ""
        const cols = 25
        const rows = 6
        const brandBlue = "#0026FF"
        const probabilities = [0.1, 0.2, 0.5, 0.7, 1, 1]
        const targetCells: HTMLElement[] = []

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cell = document.createElement("div")
            cell.className = "w-full h-full will-change-opacity"
            cell.style.backgroundColor = brandBlue
            cell.style.opacity = "1"
            cell.style.margin = "0 -1px -1px 0"

            if (Math.random() < probabilities[r]) {
              targetCells.push(cell)
            }
            bottomWrapper.appendChild(cell)
          }
        }

        gsap.to(targetCells, {
          opacity: 0,
          duration: 0.05,
          stagger: {
            each: 0.003,
            from: "random",
          },
          ease: "none",
          scrollTrigger: {
            trigger: bottomWrapper,
            start: "top bottom",
            end: "top 20%",
            scrub: true,
          },
        })
      }

      // 3. Atelier Letter-by-Letter Sticky Title Animation
      const title = titleRef.current
      if (title) {
        const wordWrappers = title.querySelectorAll<HTMLElement>("[data-text]")
        if (wordWrappers.length > 0) {
          const spans: HTMLElement[] = []
          wordWrappers.forEach((wrapper) => {
            const rawText = wrapper.getAttribute("data-text") || wrapper.textContent || ""
            wrapper.textContent = ""

            for (const char of rawText) {
              const span = document.createElement("span")
              span.className = "inline-block will-change-transform"
              span.textContent = char === " " ? "\u00A0" : char
              wrapper.appendChild(span)
              spans.push(span)
            }
          })

          gsap.set(spans, { yPercent: 100 })

          gsap.to(spans, {
            yPercent: 0,
            duration: 1.2,
            stagger: 0.05,
            ease: "power4.out",
            scrollTrigger: {
              trigger: title,
              start: "top 70%",
              toggleActions: "play none none none",
            },
          })
        }
      }

      // 4. Cards Reveal (Slide In Only — No Fade In, No Zoom/Pulse):
      // Cards are always fully visible. When scrolled into view, they only
      // perform a clean vertical slide in, with no fade or scale changes.
      const cards = root.current!.querySelectorAll<HTMLElement>(".js-flying-card")
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { y: 60 },
          {
            y: 0,
            duration: 0.65,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              once: true,
            },
          }
        )
      })
    })

    // Reduced motion fallback
    mm.add(MQ.reduce, () => {
      const title = titleRef.current
      if (title) {
        const spans = title.querySelectorAll<HTMLElement>("span")
        gsap.set(spans, { yPercent: 0 })
      }
      const cards = root.current!.querySelectorAll<HTMLElement>(".js-flying-card")
      gsap.set(cards, { y: 0 })
    })
  })

  return (
    <section id="activities" ref={root} className="relative z-10 w-full bg-transparent">
      {/* ============================================================ */}
      {/* TOP PIXEL TRANSITION (TRANSPARENT -> U FILL BRAND BLUE)      */}
      {/* ============================================================ */}
      <div
        ref={topPixelRef}
        aria-hidden
        className="w-full h-[18vw] max-h-[160px] min-h-[80px] grid grid-cols-[repeat(25,1fr)] grid-rows-[repeat(6,1fr)] overflow-hidden pointer-events-none"
      />

      {/* ============================================================ */}
      {/* U FILL BRAND BLUE CANVAS & STICKY STAGE (#0026FF)            */}
      {/* (NO black background: pure U Fill Brand Blue throughout)     */}
      {/* ============================================================ */}
      <div
        className="relative w-full text-white"
        style={{ backgroundColor: "#0026FF" }}
      >
        {/* Sticky Center Stage: Remains pinned in the center while cards fly past one by one */}
        <div className="sticky top-0 left-0 w-full h-screen z-10 flex flex-col justify-between items-center pointer-events-none py-10 sm:py-14 select-none">
          {/* Top Intro */}
          <div className="w-full flex flex-col items-center gap-2 max-w-xl text-center px-4">
            <p className="text-xs sm:text-sm font-mono tracking-widest uppercase text-white/90 font-bold">
              [10 / ACTIVITIES]
            </p>
            <p className="text-xs sm:text-sm font-sans leading-relaxed text-white/95">
              Hands-on engineering activities, robotics testing, and hardware prototyping sprints
              fostering practical mastery across our student cohorts.
            </p>
          </div>

          {/* Center Giant Anton Title */}
          <h2
            ref={titleRef}
            className="w-full text-center font-anton leading-none tracking-tight text-[clamp(3.25rem,1.2rem+11vw,18.5rem)] sm:text-[clamp(4.25rem,2.2rem+14vw,18.5rem)] text-white uppercase overflow-hidden flex flex-col sm:flex-row items-center justify-center gap-y-1 sm:gap-y-0 sm:gap-x-4 md:gap-x-6"
          >
            <span className="inline-block overflow-hidden py-1" data-text="OUR">
              OUR
            </span>
            <span className="inline-block overflow-hidden py-1" data-text="ACTIVITIES">
              ACTIVITIES
            </span>
          </h2>

          {/* Bottom Intro */}
          <div className="w-full flex flex-col items-center gap-2 max-w-xl text-center px-4">
            <p className="text-xs sm:text-sm font-mono tracking-widest uppercase text-white/90 font-bold">
              [PRACTICAL MASTERY]
            </p>
            <p className="text-xs sm:text-sm font-sans leading-relaxed text-white/95">
              Empowering the next generation of engineers through peer collaboration, logic
              development, and real-world circuit integration.
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* FLYING CARDS SEQUENCE (ONE BY ONE — NO PARALLEL FORMATION)   */}
        {/* Begins AFTER the title has scrolled up and fixed in place.   */}
        {/* Each card has its own dedicated min-h-screen phase.          */}
        {/* Alternates Left and Right to frame the pinned center title.  */}
        {/* ============================================================ */}
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-8 lg:px-14">
          {ACTIVITIES.map((activity, index) => {
            const Icon = activity.icon
            const cardNumber = `/00${index + 1}`
            const isRightSide = index % 2 === 1

            return (
              <div
                key={activity.title}
                className={cn(
                  "min-h-screen flex items-center py-20 sm:py-28",
                  isRightSide
                    ? "justify-end sm:pr-6 lg:pr-12 xl:pr-16"
                    : "justify-start sm:pl-6 lg:pl-12 xl:pl-16"
                )}
              >
                {/* Pure White Card with Brand Blue Heading & Strictly Black Body Text */}
                <article
                  className={cn(
                    "js-flying-card group flex flex-col justify-between",
                    "w-full max-w-[390px] sm:max-w-[420px] lg:max-w-[440px] aspect-[1/1.22]",
                    "p-6 sm:p-8 rounded-none border border-black/10",
                    "shadow-[0_24px_60px_rgba(0,0,0,0.35)] hover:shadow-[0_28px_70px_rgba(0,0,0,0.45)] transition-shadow duration-300 cursor-pointer"
                  )}
                  style={{ backgroundColor: "#FFFFFF" }}
                  onClick={(e) =>
                    openImageModal(e.currentTarget, {
                      src: activity.image,
                      alt: activity.title,
                      title: activity.title,
                      subtitle: activity.tag,
                      category: "Student Innovation Project",
                      badge: "Practical Training Module",
                      description: activity.desc,
                      meta: [
                        { label: "Specialization", value: activity.tag },
                        { label: "Skill Mastery", value: "Practical Lab Prototyping" },
                        { label: "Learning Mode", value: "Peer Collaboration & Mentorship" },
                        { label: "Academy", value: "U Fill Academy" },
                      ],
                    })
                  }
                >
                  {/* Top Meta Line: Strictly Black */}
                  <div className="flex items-center justify-between text-xs sm:text-sm font-mono tracking-wider mb-2">
                    <span
                      className="flex items-center gap-1.5 uppercase font-semibold"
                      style={{ color: "#000000" }}
                    >
                      <Icon className="h-4 w-4" style={{ color: "#000000" }} aria-hidden />
                      {activity.tag}
                    </span>
                    <span
                      className="font-mono font-bold tracking-widest"
                      style={{ color: "#000000" }}
                    >
                      {cardNumber}
                    </span>
                  </div>

                  {/* Heading Title: U Fill Brand Blue (#0026FF) in Anton font */}
                  <h3
                    className="font-anton text-2xl sm:text-3xl lg:text-[2.15rem] tracking-wide leading-tight my-2.5 transition-colors"
                    style={{ color: "#0026FF" }}
                  >
                    {activity.title}
                  </h3>

                  {/* Activity Photography Frame */}
                  <div className="relative overflow-hidden aspect-[16/10] border border-black/15 bg-neutral-100 my-2.5">
                    <img
                      src={activity.image}
                      alt={activity.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity flex items-end p-2.5">
                      <span className="text-[10px] font-mono tracking-widest text-white uppercase font-medium">
                        [EXPAND ACTIVITY]
                      </span>
                    </div>
                  </div>

                  {/* Body Description: Strictly Black */}
                  <p
                    className="text-xs sm:text-sm font-sans leading-relaxed font-normal mb-3 line-clamp-3"
                    style={{ color: "#000000" }}
                  >
                    {activity.desc}
                  </p>

                  {/* Bottom Meta & Number: Strictly Black */}
                  <div
                    className="mt-auto pt-3 flex items-center justify-between border-t border-black/10 text-xs font-mono"
                    style={{ color: "#000000" }}
                  >
                    <span
                      className="text-[10px] uppercase tracking-widest font-semibold"
                      style={{ color: "#000000" }}
                    >
                      [PRACTICAL MODULE]
                    </span>
                    <span
                      className="font-bold tracking-widest"
                      style={{ color: "#000000" }}
                    >
                      {cardNumber}
                    </span>
                  </div>
                </article>
              </div>
            )
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM PIXEL LEAVE TRANSITION (U FILL BRAND BLUE -> TRANSPARENT) */}
      {/* ============================================================ */}
      <div
        ref={bottomPixelRef}
        aria-hidden
        className="w-full h-[18vw] max-h-[160px] min-h-[80px] grid grid-cols-[repeat(25,1fr)] grid-rows-[repeat(6,1fr)] overflow-hidden pointer-events-none"
      />
    </section>
  )
}

export default ActivitiesSection
