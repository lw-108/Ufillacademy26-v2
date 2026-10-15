import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react"
import Navbar from "@/components/navbar"
import HeroSection from "./sections/HeroSection"
import Banner1 from "./sections/BannerSection"
import StatsSection from "./sections/StatsSection"
import { Terrain } from "./components/Terrain"
import HandsTouchIntro from "./components/HandsTouchIntro"
import { RepeatingImageProvider } from "@/components/RepeatingImageTransitionModal"
import { installAnchorScroll, refreshScroll, watchLayout } from "@/lib/gsap"
import { initSmoothScroll, getLenis } from "@/lib/lenis"
import { markAppReady } from "@/lib/app-ready"

/**
 * Everything below the fold ships as ONE lazy chunk.
 */
const loadBelowFold = () => import("./BelowFold")
const BelowFold = lazy(loadBelowFold)
void loadBelowFold()

export function App() {
  const [hasCompletedHands, setHasCompletedHands] = useState(false)
  const mainRef = useRef<HTMLElement>(null)

  const handleHandsTouchComplete = useCallback(() => {
    setHasCompletedHands(true)
    window.scrollTo(0, 0)
    getLenis()?.start()
    refreshScroll(50)
  }, [])

  useEffect(() => {
    markAppReady()
    const main = mainRef.current
    const disposeSmoothScroll = initSmoothScroll()

    // Ensure Lenis is stopped while hands intro is running
    if (!hasCompletedHands) {
      window.scrollTo(0, 0)
      getLenis()?.stop()
    }

    const disposeAnchors = installAnchorScroll()
    const disposeLayout = main ? watchLayout(main) : () => {}
    return () => {
      disposeSmoothScroll()
      disposeAnchors()
      disposeLayout()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <RepeatingImageProvider>
      {!hasCompletedHands && (
        <HandsTouchIntro onComplete={handleHandsTouchComplete} />
      )}

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <div className="relative min-h-screen font-sans text-ink [overflow-x:clip] isolate">
        <Terrain />
        <Navbar />
        <main id="main" ref={mainRef} className="relative z-10">
          <HeroSection />
          <Banner1 />
          <StatsSection />
          <Suspense fallback={<div className="min-h-screen" aria-hidden />}>
            <BelowFold />
          </Suspense>
        </main>
      </div>
    </RepeatingImageProvider>
  )
}

export default App
