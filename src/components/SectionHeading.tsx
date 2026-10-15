import { useRef, type ReactNode } from "react"
import { gsap, MQ, splitReveal, useScene } from "@/lib/gsap"
import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  /** Optional section number, e.g. "01". Kept optional for backward compatibility. */
  index?: string
  /** Short mono label shown as the section eyebrow. */
  eyebrow: string
  title: ReactNode
  lead?: ReactNode
  className?: string
  /** Wider title / lead, used by full-bleed sections. */
  wide?: boolean
}

/**
 * Shared section header — clean mono eyebrow + hairline rule, masked serif title,
 * fading lead. Owns its own scroll-triggered entrance so every section on
 * the page opens with the same, precisely-timed motion.
 */
export function SectionHeading({
  index: _index,
  eyebrow,
  title,
  lead,
  className,
  wide = false,
}: SectionHeadingProps) {
  const root = useRef<HTMLElement>(null)

  useScene(root, (mm) => {
    mm.add(MQ.motion, () => {
      const el = root.current!
      const rule = el.querySelector<HTMLElement>("[data-rule]")
      const label = el.querySelector<HTMLElement>("[data-label]")
      const heading = el.querySelector<HTMLElement>("[data-title]")
      const leadEl = el.querySelector<HTMLElement>("[data-lead]")

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        defaults: { ease: "power3.out" },
      })
      if (rule) {
        gsap.set(rule, { scaleX: 0, transformOrigin: "left center" })
        tl.to(rule, { scaleX: 1, duration: 1.1, ease: "power3.inOut" }, 0)
      }
      if (label) {
        gsap.set(label, { autoAlpha: 0, y: 8 })
        tl.to(label, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.15)
      }
      if (leadEl) {
        gsap.set(leadEl, { autoAlpha: 0, y: 20 })
        tl.to(leadEl, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.55)
      }
      if (heading) splitReveal(heading, { delay: 0.1 })
    })
  })

  return (
    <header ref={root} className={cn("relative", className)}>
      <div className="flex items-center gap-3">
        <span data-label className="label-mono flex shrink-0 items-center gap-2 text-ink">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
          <span>{eyebrow}</span>
        </span>
        <span data-rule aria-hidden className="block h-px flex-1 bg-ink/20" />
      </div>

      <h2
        data-title
        className={cn(
          "mt-8 font-anton uppercase text-[clamp(2.75rem,7.5vw,6.25rem)] leading-[0.92] tracking-tight text-ink",
          wide ? "max-w-5xl" : "max-w-4xl"
        )}
      >
        {title}
      </h2>

      {lead && (
        <p
          data-lead
          className={cn(
            "mt-6 text-base font-medium leading-relaxed text-mute sm:text-lg",
            wide ? "max-w-2xl" : "max-w-xl"
          )}
        >
          {lead}
        </p>
      )}
    </header>
  )
}

export default SectionHeading
