/**
 * Single source of truth for GSAP.
 *
 * Every section imports `gsap` / `ScrollTrigger` from here. Previously the
 * site loaded GSAP twice — once from a CDN <script> (`window.gsap`) and once
 * from npm — which gave two independent ScrollTrigger instances with separate
 * pin-spacers and scroll listeners. They never knew about each other's
 * layout, which is what made sections drift, overlap and appear to "repeat"
 * while scrolling. One instance, registered once, fixes that at the root.
 */
import { useLayoutEffect, type RefObject } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { SplitText } from "gsap/SplitText"
import { Flip } from "gsap/Flip"
import { smoothScrollTo } from "./lenis"

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText, Flip)

gsap.config({ nullTargetWarn: false })
ScrollTrigger.config({
  // Mobile URL-bar show/hide fires resize; don't rebuild every pin for it.
  ignoreMobileResize: true,
})

export { gsap, ScrollTrigger, SplitText, Flip }

/** Media queries shared by every section so breakpoints never disagree. */
export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  /** Phones: no pinning / scrubbing, cheap one-shot reveals only. */
  mobile: "(max-width: 767px)",
  /** Tablet and up. */
  md: "(min-width: 768px)",
  /** Laptop and up. */
  lg: "(min-width: 1024px)",
} as const

/** `gsap.matchMedia` condition maps used repeatedly across sections. */
export const CONDITIONS = {
  /** Pins / scrubs need width AND height (short landscape phones would clip pinned content). */
  full: `${MQ.md} and (min-height: 560px) and ${MQ.motion}`,
  simple: `${MQ.mobile}, ${MQ.reduce}`,
} as const

/* ------------------------------------------------------------------ */
/* Scroll refresh                                                      */
/* ------------------------------------------------------------------ */

let refreshTimer: number | undefined

/**
 * Debounced `ScrollTrigger.refresh()`. Call whenever something changes the
 * page's layout height after triggers were measured (images decoding, an
 * accordion opening, a modal closing…). Pinned sections cache their start /
 * end pixel values, so a stale measurement is the #1 cause of pin glitches.
 */
export function refreshScroll(delay = 120) {
  window.clearTimeout(refreshTimer)
  refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), delay)
}

/**
 * Keeps ScrollTrigger measurements honest for the whole page:
 *  - fonts finishing (text reflow shifts every panel below)
 *  - any <img> finishing its load (capture phase catches all of them)
 *  - the observed root changing height for any other reason
 * Returns a disposer.
 */
export function watchLayout(root: HTMLElement): () => void {
  let lastHeight = root.offsetHeight

  const onLoad = (e: Event) => {
    if (e.target instanceof HTMLImageElement) refreshScroll(150)
  }
  document.addEventListener("load", onLoad, true)

  let cancelled = false
  document.fonts?.ready.then(() => {
    if (!cancelled) refreshScroll(50)
  })

  const ro = new ResizeObserver(() => {
    const h = root.offsetHeight
    if (Math.abs(h - lastHeight) < 2) return
    lastHeight = h
    refreshScroll(200)
  })
  ro.observe(root)

  return () => {
    cancelled = true
    document.removeEventListener("load", onLoad, true)
    ro.disconnect()
    window.clearTimeout(refreshTimer)
  }
}

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/**
 * Builds a scoped, media-query-aware GSAP scene and tears it down cleanly.
 *
 * `build` receives a `gsap.MatchMedia` bound to `scope`, so every selector
 * inside is limited to that element and every tween / ScrollTrigger created
 * is reverted on unmount (StrictMode-safe). Add conditions with `mm.add`.
 */
export function useScene(
  scope: RefObject<HTMLElement | null>,
  build: (mm: gsap.MatchMedia) => void,
  deps: readonly unknown[] = []
) {
  useLayoutEffect(() => {
    const el = scope.current
    if (!el) return
    const mm = gsap.matchMedia(el)
    build(mm)
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/* ------------------------------------------------------------------ */
/* Shared motion primitives                                            */
/* ------------------------------------------------------------------ */

/**
 * One-shot scroll reveal for every `[data-reveal]` element inside `root`.
 * Hidden state is applied with `gsap.set` (inside the caller's context, so
 * it's reverted with it) and released by `ScrollTrigger.batch` with
 * `once: true` — nothing ever replays or re-hides while scrolling back up.
 *
 * `data-reveal="left" | "right" | "up"(default) | "fade"` picks the direction.
 */
export function revealOnScroll(root: Element, selector = "[data-reveal]") {
  const items = gsap.utils.toArray<HTMLElement>(selector, root)
  if (items.length === 0) return

  const from = (el: HTMLElement) => {
    switch (el.dataset.reveal) {
      case "left":
        return { x: -48, y: 0 }
      case "right":
        return { x: 48, y: 0 }
      case "fade":
        return { x: 0, y: 0 }
      default:
        return { x: 0, y: 32 }
    }
  }

  items.forEach((el) => gsap.set(el, { autoAlpha: 0, ...from(el) }))

  ScrollTrigger.batch(items, {
    start: "top 88%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.09,
        overwrite: "auto",
        clearProps: "transform",
      }),
  })
}

/**
 * Masked line-by-line headline reveal. Splits the element into lines,
 * masks each so the text rises out of an invisible slot, and plays once when
 * it enters the viewport. Re-splits automatically if the width changes
 * (`autoSplit`) so wrapped lines never desync from what's on screen.
 */
export function splitReveal(el: HTMLElement, opts: { delay?: number; start?: string } = {}) {
  SplitText.create(el, {
    type: "lines",
    mask: "lines",
    linesClass: "split-line",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.lines, {
        yPercent: 110,
        duration: 1,
        ease: "power4.out",
        stagger: 0.09,
        delay: opts.delay ?? 0,
        scrollTrigger: { trigger: el, start: opts.start ?? "top 88%", once: true },
      }),
  })
}

/** Smooth-scroll to an in-page anchor, offset for the fixed navbar using Lenis. */
export function scrollToTarget(target: string | Element, offsetY = 72) {
  if (typeof target === "string" || target instanceof HTMLElement) {
    smoothScrollTo(target as HTMLElement, { offset: -offsetY, duration: 1.2 })
  } else {
    gsap.to(window, {
      duration: 1.1,
      ease: "power3.inOut",
      scrollTo: { y: target, offsetY, autoKill: true },
    })
  }
}

/** Intercepts same-page `#anchor` clicks and routes them through GSAP. */
export function installAnchorScroll(): () => void {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
    const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href^='#']")
    if (!a) return
    const hash = a.getAttribute("href")
    if (!hash || hash === "#") return
    const target = document.querySelector(hash)
    if (!target) return
    e.preventDefault()
    scrollToTarget(target)
    history.replaceState(null, "", hash)
  }
  document.addEventListener("click", onClick)
  return () => document.removeEventListener("click", onClick)
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia(MQ.reduce).matches
