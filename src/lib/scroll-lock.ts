// scroll-lock.ts
// Shared counter so multiple components (loading screen, mobile nav,
// modals, etc.) can each request a scroll lock without stomping on
// each other's cleanup. Whoever locks last no longer silently wins.
import { getLenis } from "./lenis"

let lockCount = 0

export function lockScroll() {
  lockCount++
  if (lockCount === 1) {
    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"
    getLenis()?.stop()
  }
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    document.body.style.overflow = ""
    document.documentElement.style.overflow = ""
    getLenis()?.start()
  }
}