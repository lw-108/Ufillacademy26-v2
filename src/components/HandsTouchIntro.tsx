import { useEffect, useRef, useState, useCallback } from "react"
import { gsap, prefersReducedMotion } from "@/lib/gsap"
import { lockScroll, unlockScroll } from "@/lib/scroll-lock"

interface HandsTouchIntroProps {
  onComplete?: () => void
}

/**
 * HandsTouchIntro
 *
 * Silky smooth, physics-interpolated hands connection experience.
 * Uses continuous 120fps inertia damping (lerp) for liquid-smooth tactile motion
 * across mouse wheels, trackpads, and mobile touch.
 *
 * - Exact anatomical fingertip contact coordinates calculated directly from PNG scanlines
 *   (Human: 85.17% X, 33.46% Y | Robot: 21.66% X, 80.47% Y).
 * - Full z-index isolation (z-[100]) so underlying navbar and elements never bleed through.
 * - Clean, clutter-free screen with pure white canvas and radiant fingertip spark.
 */
export function HandsTouchIntro({ onComplete }: HandsTouchIntroProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const humanHandRef = useRef<HTMLDivElement>(null)
  const robotHandRef = useRef<HTMLDivElement>(null)
  const sparkRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const scrollHintRef = useRef<HTMLDivElement>(null)

  const [isDismissed, setIsDismissed] = useState(false)
  const isTriggeringSequenceRef = useRef(false)

  // Fluid physics progress targets
  const targetProgressRef = useRef(0)
  const currentProgressRef = useRef(0)
  const touchStartY = useRef<number | null>(null)

  // Trigger the touch, spark, flash, and dismissal sequence
  const executeTouchSequence = useCallback(() => {
    if (isTriggeringSequenceRef.current) return
    isTriggeringSequenceRef.current = true

    const human = humanHandRef.current
    const robot = robotHandRef.current
    const spark = sparkRef.current
    const flash = flashRef.current
    const scrollHint = scrollHintRef.current
    const root = rootRef.current

    if (!human || !robot || !spark || !flash || !root) {
      window.scrollTo(0, 0)
      unlockScroll()
      setIsDismissed(true)
      onComplete?.()
      return
    }

    const tl = gsap.timeline({
      onComplete: () => {
        window.scrollTo(0, 0)
        unlockScroll()
        setIsDismissed(true)
        onComplete?.()
      },
    })

    tl
      // Prompt fades away cleanly
      .to(scrollHint, { autoAlpha: 0, duration: 0.1, ease: "power2.out" }, 0)
      // Hands smoothly meet at exact contact point
      .to(human, { xPercent: 0, yPercent: 0, duration: 0.16, ease: "power2.out" }, 0)
      .to(robot, { xPercent: 0, yPercent: 0, duration: 0.16, ease: "power2.out" }, 0)
      // Fingertip contact spark flares up at the touch point
      .to(spark, { autoAlpha: 1, scale: 2.2, duration: 0.12, ease: "power2.out" }, 0.1)
      // Radiant luminous flash blankets the screen
      .to(flash, { autoAlpha: 1, duration: 0.14, ease: "power2.in" }, 0.16)
      .to(spark, { scale: 3.2, autoAlpha: 0, duration: 0.1 }, 0.22)
      // Hands hide under the flash
      .set([human, robot], { autoAlpha: 0 }, 0.28)
      // Flash clears smoothly, seamlessly revealing the website
      .to(flash, { autoAlpha: 0, duration: 0.3, ease: "power2.out" }, 0.3)
      // Root overlay fades out cleanly
      .to(root, { autoAlpha: 0, duration: 0.2, ease: "power2.out" }, 0.42)
  }, [onComplete])

  useEffect(() => {
    if (prefersReducedMotion()) {
      setIsDismissed(true)
      onComplete?.()
      return
    }

    window.scrollTo(0, 0)
    lockScroll()

    const human = humanHandRef.current
    const robot = robotHandRef.current
    const spark = sparkRef.current
    const flash = flashRef.current
    const scrollHint = scrollHintRef.current
    const root = rootRef.current

    if (!human || !robot || !spark || !flash || !scrollHint || !root) {
      window.scrollTo(0, 0)
      unlockScroll()
      return
    }

    // Set initial clean transforms aligned with anatomical arm trajectories
    // Human: -24% X, +10.9% Y | Robot: +22% X, -20.4% Y
    gsap.set(human, { xPercent: -24, yPercent: 10.9, opacity: 1 })
    gsap.set(robot, { xPercent: 22, yPercent: -20.4, opacity: 1 })
    gsap.set(spark, { autoAlpha: 0, scale: 0.1 })
    gsap.set(flash, { autoAlpha: 0 })
    gsap.set(scrollHint, { autoAlpha: 1, y: 0 })

    let animFrameId = 0
    let startTime = performance.now()

    // ── High-Performance Physics Lerp Loop ─────────────────────────────
    const tick = (now: number) => {
      if (isTriggeringSequenceRef.current) return

      // Pin scroll to top so underlying sections never drift
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0)
      }

      const elapsed = (now - startTime) / 1000

      // Silky critically damped exponential lerp (fast, smooth, zero jitter)
      currentProgressRef.current +=
        (targetProgressRef.current - currentProgressRef.current) * 0.12

      const p = Math.max(0, Math.min(1, currentProgressRef.current))

      // Micro-subtle idle float before interaction; fades completely to 0 on movement
      const idleWeight = Math.max(0, 1 - p * 6)
      const idleHumanY = Math.sin(elapsed * 1.8) * 0.8 * idleWeight
      const idleRobotY = -Math.sin(elapsed * 1.8) * 0.8 * idleWeight

      // Linear anatomical approach straight to the fingertip contact point
      const humanX = -24 * (1 - p)
      const humanY = 10.9 * (1 - p) + idleHumanY
      const robotX = 22 * (1 - p)
      const robotY = -20.4 * (1 - p) + idleRobotY

      gsap.set(human, { xPercent: humanX, yPercent: humanY })
      gsap.set(robot, { xPercent: robotX, yPercent: robotY })

      // Scroll hint dissolves away smoothly as user moves
      const hintAlpha = Math.max(0, 1 - p * 2.8)
      gsap.set(scrollHint, { autoAlpha: hintAlpha, y: p * 14 })

      // Ethereal pre-contact glow as fingertips approach (p > 0.65)
      if (p > 0.65) {
        const preSpark = (p - 0.65) / 0.35
        gsap.set(spark, { autoAlpha: preSpark * 0.8, scale: 0.2 + preSpark * 0.7 })
      } else {
        gsap.set(spark, { autoAlpha: 0 })
      }

      // When progress reaches contact threshold (0.96), trigger contact spark & flash
      if (p >= 0.96 || targetProgressRef.current >= 0.98) {
        executeTouchSequence()
        return
      }

      animFrameId = requestAnimationFrame(tick)
    }

    animFrameId = requestAnimationFrame(tick)

    // ── Input Listeners with Proportional Delta & Full Scroll Isolation ─
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopImmediatePropagation()
      if (isTriggeringSequenceRef.current) return

      let delta = e.deltaY
      if (e.deltaMode === 1) delta *= 36
      else if (e.deltaMode === 2) delta *= 600

      // Proportional step for fluid precision
      const step = delta * 0.0018
      targetProgressRef.current = Math.min(1, Math.max(0, targetProgressRef.current + step))
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY.current = e.touches[0].clientY
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      e.stopImmediatePropagation()
      if (isTriggeringSequenceRef.current || touchStartY.current === null) return
      const currentY = e.touches[0].clientY
      const deltaY = touchStartY.current - currentY
      const step = deltaY / 180
      targetProgressRef.current = Math.min(1, Math.max(0, targetProgressRef.current + step))
      touchStartY.current = currentY
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", "Space", "Enter", " "].includes(e.key)) {
        e.preventDefault()
        e.stopImmediatePropagation()
        if (isTriggeringSequenceRef.current) return
        targetProgressRef.current = Math.min(1, targetProgressRef.current + 0.35)
      } else if (["ArrowUp", "PageUp", "Home", "End"].includes(e.key)) {
        e.preventDefault()
        e.stopImmediatePropagation()
        targetProgressRef.current = Math.max(0, targetProgressRef.current - 0.25)
      }
    }

    // Attach in capture phase to guarantee interception before other elements
    window.addEventListener("wheel", onWheel, { capture: true, passive: false })
    window.addEventListener("touchstart", onTouchStart, { capture: true, passive: false })
    window.addEventListener("touchmove", onTouchMove, { capture: true, passive: false })
    window.addEventListener("keydown", onKeyDown, { capture: true, passive: false })

    return () => {
      cancelAnimationFrame(animFrameId)
      window.scrollTo(0, 0)
      unlockScroll()
      window.removeEventListener("wheel", onWheel, { capture: true })
      window.removeEventListener("touchstart", onTouchStart, { capture: true })
      window.removeEventListener("touchmove", onTouchMove, { capture: true })
      window.removeEventListener("keydown", onKeyDown, { capture: true })
    }
  }, [executeTouchSequence, onComplete])

  if (isDismissed) return null

  return (
    <div
      ref={rootRef}
      role="region"
      aria-label="Interactive Hands Connection"
      className="fixed inset-0 z-[100] overflow-hidden bg-white select-none pointer-events-auto cursor-pointer"
      style={{ height: "100dvh", willChange: "opacity" }}
      onClick={() => {
        if (isTriggeringSequenceRef.current) return
        // Smoothly glide to contact on tap/click
        gsap.to(targetProgressRef, {
          current: 1,
          duration: 0.45,
          ease: "power2.out",
        })
      }}
    >
      {/* Human Hand: Anchor pinned precisely at fingertip contact point (85.17% X, 33.46% Y) */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: "50%",
          top: "50%",
          width: "clamp(260px, min(80vw, 120vh), 1400px)",
          aspectRatio: "1376 / 768",
          transform: "translate(-85.1744%, -33.4635%)",
        }}
      >
        <div
          ref={humanHandRef}
          className="h-full w-full will-change-transform"
          style={{
            transformOrigin: "85.1744% 33.4635%",
          }}
        >
          <img
            src="/images/human-hand-white.png"
            alt="Human hand reaching forward"
            className="h-full w-full object-contain select-none pointer-events-none"
            style={{
              filter: "drop-shadow(0 14px 28px rgba(0, 0, 0, 0.06))",
              maskImage: "linear-gradient(to right, transparent 0%, black 14%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 14%)",
            }}
          />
        </div>
      </div>

      {/* Robotic Hand: Anchor pinned precisely at fingertip contact point (21.66% X, 80.47% Y) */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: "50%",
          top: "50%",
          width: "clamp(260px, min(80vw, 120vh), 1400px)",
          aspectRatio: "1376 / 768",
          transform: "translate(-21.657%, -80.4688%)",
        }}
      >
        <div
          ref={robotHandRef}
          className="h-full w-full will-change-transform"
          style={{
            transformOrigin: "21.657% 80.4688%",
          }}
        >
          <img
            src="/images/robot-hand-white.png"
            alt="Robotic hand reaching forward"
            className="h-full w-full object-contain select-none pointer-events-none"
            style={{
              filter: "drop-shadow(0 14px 28px rgba(0, 0, 0, 0.06))",
              maskImage: "linear-gradient(to left, transparent 0%, black 14%)",
              WebkitMaskImage: "linear-gradient(to left, transparent 0%, black 14%)",
            }}
          />
        </div>
      </div>

      {/* Fingertip Contact Spark & Energy Bloom at the exact contact point */}
      <div
        ref={sparkRef}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={{
          width: "clamp(100px, 18vw, 220px)",
          height: "clamp(100px, 18vw, 220px)",
        }}
      >
        {/* Soft radial blue/cyan bloom */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: "55%",
            height: "55%",
            background:
              "radial-gradient(circle, #ffffff 0%, #38bdf8 30%, #0026ff 65%, transparent 85%)",
            filter: "blur(4px)",
          }}
        />
        {/* Diamond spark center point */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "9999px",
            backgroundColor: "#ffffff",
            boxShadow:
              "0 0 20px 8px rgba(255, 255, 255, 0.95), 0 0 45px 20px rgba(0, 38, 255, 0.75)",
          }}
        />
      </div>

      {/* Minimalist, elegant hint that dissolves on interaction */}
      <div
        ref={scrollHintRef}
        className="pointer-events-none absolute bottom-8 sm:bottom-12 left-0 right-0 flex justify-center text-center will-change-transform"
      >
        <span className="font-mono text-[11px] sm:text-xs tracking-[0.3em] uppercase text-ink/40 font-medium">
          Scroll or tap to connect
        </span>
      </div>

      {/* Full-Screen Pure Radiant Light Flash Beam */}
      <div
        ref={flashRef}
        className="pointer-events-none absolute inset-0 bg-background will-change-opacity"
        style={{ opacity: 0, zIndex: 110 }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, #ffffff 0%, var(--background, ffffff) 60%, rgba(219, 226, 255, 0.8) 100%)",
          }}
        />
      </div>
    </div>
  )
}

export default HandsTouchIntro

