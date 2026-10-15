import { useRef } from "react"
import { gsap, MQ, useScene } from "@/lib/gsap"

/**
 * Fixed mountain-range backdrop. It is pinned to the viewport (it never
 * scrolls): the page's sections slide over it, so it shows through
 * transparent backgrounds and is covered wherever a section is opaque.
 *
 * z-index is NEGATIVE, not 0. A static (non-positioned) element — which is
 * what a plain `<section>` is unless it opts into `relative` — always
 * paints in front of a negative-z-index layer, regardless of DOM order.
 * With z-0 the opposite was true for any section that happened to have no
 * `position` of its own: it fell into the same paint step as this fixed,
 * z-0 layer and lost to it by DOM order, so its content was hidden behind
 * the mountains. A negative z-index makes this always paint furthest back,
 * without depending on every section remembering to declare `relative`.
 */

const T_W = 1800
const T_H = 300

/**
 * Mountain-range silhouette. "Ridged" noise (1 - |sin|) turns smooth waves
 * into sharp peaks and V-shaped valleys; a few octaves plus a small
 * deterministic jitter give natural, uneven summits.
 */
function ridgePath(seed: number, base: number, amp: number, freq: number): string {
  const jitter = (n: number) => {
    const x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453
    return (x - Math.floor(x)) * 2 - 1
  }
  const pts: string[] = []
  for (let x = 0; x <= T_W; x += 8) {
    const r1 = 1 - Math.abs(Math.sin(x * freq + seed))
    const r2 = 1 - Math.abs(Math.sin(x * freq * 2.3 + seed * 1.9))
    const r3 = 1 - Math.abs(Math.sin(x * freq * 5.1 + seed * 3.3))
    const h = r1 * 0.62 + r2 * 0.26 + r3 * 0.12 + jitter(x / 8) * 0.025
    pts.push(`${x} ${(base - h * amp).toFixed(1)}`)
  }
  return `M0 ${T_H} L${pts.join(" L")} L${T_W} ${T_H} Z`
}

// Solid fills, back (palest, tallest) to front (deepest, lowest).
const TERRAIN_LAYERS = [
  { depth: 0.35, d: ridgePath(0.9, 210, 170, 0.0042), fill: "#dbe2ff" },
  { depth: 0.7, d: ridgePath(2.7, 250, 130, 0.0058), fill: "#a9b8ff" },
  { depth: 1.15, d: ridgePath(4.4, 292, 95, 0.0079), fill: "#6b82ff" },
]

export function Terrain() {
  const root = useRef<HTMLDivElement>(null)

  useScene(root, (mm) => {
    // Pointer parallax: each ridge chases the mouse at its own depth and lag.
    mm.add({ fine: "(hover: hover) and (pointer: fine)", motion: MQ.motion }, (ctx) => {
      const c = ctx.conditions as Record<string, boolean>
      if (!c.fine || !c.motion) return
      const layers = gsap.utils.toArray<SVGElement>("[data-layer]", root.current!)
      const MAX = 90
      const movers = layers.map((layer, i) => ({
        x: gsap.quickTo(layer, "x", { duration: 1.9 - i * 0.55, ease: "power3.out" }),
        depth: Number(layer.dataset.depth),
      }))
      let rafId = 0
      let latestClientX = 0
      let isScheduled = false

      const updateMovers = () => {
        isScheduled = false
        const nx = (latestClientX / window.innerWidth) * 2 - 1
        movers.forEach((m) => m.x(-nx * MAX * m.depth))
      }

      const onMove = (e: PointerEvent) => {
        latestClientX = e.clientX
        if (!isScheduled) {
          isScheduled = true
          rafId = requestAnimationFrame(updateMovers)
        }
      }

      const onLeave = () => {
        if (isScheduled) {
          cancelAnimationFrame(rafId)
          isScheduled = false
        }
        movers.forEach((m) => m.x(0))
      }

      window.addEventListener("pointermove", onMove, { passive: true })
      document.documentElement.addEventListener("pointerleave", onLeave, { passive: true })
      return () => {
        if (isScheduled) cancelAnimationFrame(rafId)
        window.removeEventListener("pointermove", onMove)
        document.documentElement.removeEventListener("pointerleave", onLeave)
      }
    })
  })

  return (
    <div
      aria-hidden
      ref={root}
      className="pointer-events-none fixed inset-x-0 bottom-0 -z-50 h-[300px] overflow-hidden"
      style={{ zIndex: -50 }}
    >
      {TERRAIN_LAYERS.map((layer, i) => (
        <svg
          key={i}
          data-layer
          data-depth={layer.depth}
          viewBox={`0 0 ${T_W} ${T_H}`}
          preserveAspectRatio="xMidYMax slice"
          className="absolute -inset-x-[8%] bottom-0 h-full w-[116%] will-change-transform"
        >
          <path d={layer.d} fill={layer.fill} />
        </svg>
      ))}
    </div>
  )
}


export default Terrain
