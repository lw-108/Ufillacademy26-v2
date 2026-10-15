import { lazy, Suspense, useEffect, useRef } from "react"
import { ArrowUpRight } from "lucide-react"
import { Logo } from "@/components/logo"
import { gsap } from "@/lib/gsap"
import { StatsSection, stats, formatStat, type Stat } from "./StatsSection"

const Robotics3DMorph = lazy(() => import("@/components/Robotics3DMorph"))

export { StatsSection, StatsSection as HeroStats, stats, formatStat, type Stat }

const flipWords = ["Knowledge.", "Future.", "Career.", "Vision."]

/* ---------------------------------------------------------------------
   HeroSection (Clean, Standalone Component without Hands Embedded)
--------------------------------------------------------------------- */

export function HeroSection() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return

    // Word roll marquee (seamless looping vertical flip words)
    const col = el.querySelector<HTMLElement>("[data-roll]")
    if (col) {
      const steps = flipWords.length
      const roll = gsap.timeline({ repeat: -1, delay: 1.5 })
      for (let i = 1; i <= steps; i++) {
        roll.to(
          col,
          {
            yPercent: -(i * 100) / (steps + 1),
            duration: 0.85,
            ease: "power4.inOut",
          },
          i === 1 ? 0 : "+=1.7"
        )
      }
      roll.to({}, { duration: 1.7 })
      return () => {
        roll.kill()
      }
    }
  }, [])

  return (
    <section
      id="top"
      ref={root}
      className="relative w-full flex flex-col justify-center pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 bg-transparent"
    >
      <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
        {/* Main Hero Details (Left Side) */}
        <div className="flex flex-col justify-center gap-2.5 sm:gap-3.5 lg:gap-4 lg:col-span-7">
          <div
            data-in="meta"
            className="label-mono flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-ink"
          >
            <span className="inline-block h-2 w-2 bg-brand" aria-hidden />
            <span>Robotics</span>
            <span className="text-ink/30">/</span>
            <span>Artificial Intelligence</span>
            <span className="text-ink/30">/</span>
            <span>IoT</span>
          </div>

          {/* Logo & Mascot Slot */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="inline-flex origin-center z-40">
              <Logo />
            </div>

            <img
              src="/images/urobo.png"
              alt="U Fill Robot Mascot"
              width={176}
              height={176}
              className="h-14 w-auto shrink-0 object-contain sm:h-18 md:h-22 lg:h-26"
              loading="eager"
            />
          </div>

          <h1 className="font-anton uppercase text-[clamp(2.5rem,min(6.5vw,8.5svh),5.5rem)] leading-[0.92] tracking-tight text-ink">
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-in="line" className="block">
                Fill your
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-in="line" className="block">
                {/* Sized to widest word so line never reflows */}
                <span className="relative inline-block h-[1.2em] overflow-hidden align-bottom text-brand">
                  <span data-roll className="block will-change-transform">
                    {[...flipWords, flipWords[0]].map((word, i) => (
                      <span
                        key={i}
                        aria-hidden={i > 0}
                        className="block h-[1.2em] whitespace-nowrap leading-[1.02em]"
                      >
                        {word}
                      </span>
                    ))}
                  </span>
                </span>
              </span>
            </span>
          </h1>

          <p
            data-in="copy"
            className="max-w-[48ch] text-xs font-medium leading-relaxed text-mute sm:text-sm lg:text-base"
          >
            Welcome to U Fill Academy, where innovation meets education and
            knowledge transforms into real-world career opportunities.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-0.5">
            <a
              data-in="cta"
              href="#specializations"
              className="label-mono group inline-flex h-10 sm:h-11 items-center gap-2 bg-ink px-5 sm:px-6 text-xs sm:text-sm text-white transition-colors duration-300 hover:bg-brand"
            >
              Start Learning
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <a
              data-in="cta"
              href="#about"
              className="label-mono border-b border-ink pb-1 text-xs sm:text-sm text-ink transition-colors hover:border-brand hover:text-brand"
            >
              Learn more
            </a>
          </div>
        </div>

        {/* 3D Robotics SVG Interactive Morph (Right Side) */}
        <div className="w-full lg:col-span-5 flex items-center justify-center pt-2 lg:pt-0">
          <Suspense fallback={<div className="aspect-square w-full max-w-[460px]" aria-hidden />}>
            <Robotics3DMorph />
          </Suspense>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
