import Lenis from "lenis"
import { gsap, ScrollTrigger } from "./gsap"

/**
 * Atelier-style Lenis smooth scroll engine.
 *
 * Configured with the exact physics curves from the Atelier app:
 * - duration: 1.2
 * - easing: (t) => 1 - Math.pow(1 - t, 3)
 * - Synced directly with GSAP ScrollTrigger via the GSAP ticker
 */

let lenisInstance: Lenis | null = null

export function initSmoothScroll(): () => void {
  if (typeof window === "undefined") return () => {}

  // If already initialized, clean up previous instance
  if (lenisInstance) {
    lenisInstance.destroy()
    lenisInstance = null
  }

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    touchMultiplier: 1.0,
    infinite: false,
    autoRaf: false, // Driven through GSAP ticker for frame-locked sync
  })

  lenisInstance = lenis

  // Synchronize ScrollTrigger with Lenis scroll updates
  lenis.on("scroll", () => {
    ScrollTrigger.update()
  })

  // Drive Lenis RAF inside GSAP ticker so scroll and GSAP animations render in the exact same frame
  const tickerCallback = (time: number) => {
    lenis.raf(time * 1000)
  }
  gsap.ticker.add(tickerCallback)

  // Anti-lag protection: when CPU spikes or garbage collection occurs,
  // cap delta to 33ms (equivalent to max 1-2 frames lag) so animations
  // don't stutter, freeze, or wildly jump across the screen.
  gsap.ticker.lagSmoothing(500, 33)

  // Recalculate on window resize with debounce
  let resizeTimeout: number | undefined
  const onResize = () => {
    window.clearTimeout(resizeTimeout)
    resizeTimeout = window.setTimeout(() => {
      lenis.resize()
      ScrollTrigger.refresh()
    }, 120)
  }
  window.addEventListener("resize", onResize)

  return () => {
    window.clearTimeout(resizeTimeout)
    window.removeEventListener("resize", onResize)
    gsap.ticker.remove(tickerCallback)
    lenis.destroy()
    lenisInstance = null
  }
}

export function getLenis(): Lenis | null {
  return lenisInstance
}

/**
 * Smoothly scroll to an element or selector using Atelier's smooth scroll curve.
 */
export function smoothScrollTo(
  target: string | HTMLElement,
  options?: {
    offset?: number
    duration?: number
    onComplete?: () => void
  }
) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, {
      offset: options?.offset ?? -72,
      duration: options?.duration ?? 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 2),
      onComplete: options?.onComplete,
    })
  } else {
    const el = typeof target === "string" ? document.querySelector(target) : target
    el?.scrollIntoView({ behavior: "smooth" })
    options?.onComplete?.()
  }
}
