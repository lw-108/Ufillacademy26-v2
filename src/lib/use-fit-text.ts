import { useLayoutEffect, useRef } from "react"

/**
 * Dynamically fits a single-line, `whitespace-nowrap` element's font-size
 * so that it never exceeds its parent container's width, preventing
 * overflow or clipping.
 *
 * Uses `document.createRange()` to measure the exact rendered width of
 * the text nodes, avoiding the inaccuracy of `scrollWidth` on centered text.
 */
export function useFitText<T extends HTMLElement>(deps: readonly unknown[] = []) {
  const ref = useRef<T>(null)

  useLayoutEffect(() => {
    const el = ref.current
    const parent = el?.parentElement
    if (!el || !parent) return

    let cancelled = false

    const fit = () => {
      if (cancelled) return

      // Reset inline font size so CSS clamp styles are used for measurement
      el.style.fontSize = ""

      const available = parent.clientWidth
      if (available <= 0) return

      // Measure exact text width using Range API (immune to text-center / overflow artifacts)
      const measureNatural = (): number => {
        try {
          const range = document.createRange()
          range.selectNodeContents(el)
          return range.getBoundingClientRect().width
        } catch {
          return el.scrollWidth
        }
      }
      const natural = measureNatural()

      if (natural > 0) {
        const currentSize = parseFloat(window.getComputedStyle(el).fontSize)
        if (currentSize > 0) {
          // If natural width exceeds available width, shrink font size to fit with 4% safety margin
          const scale = (available / natural) * 0.96
          if (scale < 1) {
            el.style.fontSize = `${Math.floor(currentSize * scale * 10) / 10}px`
          }
        }
      }
    }

    // Initial fit
    fit()

    // Re-fit on next animation frame in case fonts/styles just settled
    const rafId = requestAnimationFrame(fit)

    // Observe parent resize with rAF debouncing to prevent ResizeObserver loop limit errors
    const ro = new ResizeObserver(() => {
      if (!cancelled) {
        requestAnimationFrame(fit)
      }
    })
    ro.observe(parent)

    // Window resize listener
    window.addEventListener("resize", fit)

    // Re-measure when web fonts finish loading/swapping
    document.fonts?.ready.then(() => {
      if (!cancelled) fit()
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      ro.disconnect()
      window.removeEventListener("resize", fit)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}
