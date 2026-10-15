"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { SVGRenderer } from "three/examples/jsm/renderers/SVGRenderer.js"

/* --------------------------------------------------------------------------
   Wireframe Primitives & Builder
   -------------------------------------------------------------------------- */
let W: number[] = []
let AC: number[] = []
const L = (p: number[], q: number[], a?: number) => (a ? AC : W).push(...p, ...q)
const PI = Math.PI

function E(c: number[][], a?: number) {
  for (let i = 0; i < 8; i++) {
    for (const b of [1, 2, 4]) {
      if (!(i & b)) L(c[i], c[i | b], a)
    }
  }
}

function B(x: number, y: number, z: number, w: number, h: number, d: number, a?: number) {
  const c: number[][] = []
  for (let i = 0; i < 8; i++) {
    c.push([x + (i & 1 ? w : -w) / 2, y + (i & 2 ? h : -h) / 2, z + (i & 4 ? d : -d) / 2])
  }
  E(c, a)
}

function BM(x1: number, y1: number, x2: number, y2: number, w: number, zw: number, a?: number) {
  const dx = x2 - x1
  const dy = y2 - y1
  const l = Math.hypot(dx, dy)
  const nx = (-dy / l) * (w / 2)
  const ny = (dx / l) * (w / 2)
  const c: number[][] = []
  for (let i = 0; i < 8; i++) {
    const e = i & 1 ? [x2, y2] : [x1, y1]
    const s = i & 2 ? 1 : -1
    c.push([e[0] + nx * s, e[1] + ny * s, (i & 4 ? zw : -zw) / 2])
  }
  E(c, a)
}

const q = (ax: string, c: number, s: number, h: number) =>
  ax === "y" ? [c, h, s] : ax === "x" ? [h, c, s] : [c, s, h]

function R(x: number, y: number, z: number, r: number, ax: string, n?: number, a?: number, h?: number) {
  const segs = n || 16
  const height = h || 0
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * PI * 2
    const a1 = ((i + 1) / segs) * PI * 2
    const p = q(ax, Math.cos(a0) * r, Math.sin(a0) * r, height)
    const o = q(ax, Math.cos(a1) * r, Math.sin(a1) * r, height)
    L([x + p[0], y + p[1], z + p[2]], [x + o[0], y + o[1], z + o[2]], a)
  }
}

function C(x: number, y: number, z: number, r: number, h: number, ax: string, n?: number, a?: number) {
  const height = h || 0
  R(x, y, z, r, ax, n, a, -height / 2)
  R(x, y, z, r, ax, n, a, height / 2)
  for (let i = 0; i < 4; i++) {
    const t = (i * PI) / 2
    const p = q(ax, Math.cos(t) * r, Math.sin(t) * r, -height / 2)
    const o = q(ax, Math.cos(t) * r, Math.sin(t) * r, height / 2)
    L([x + p[0], y + p[1], z + p[2]], [x + o[0], y + o[1], z + o[2]], a)
  }
}

function H(x: number, y: number, z: number, len: number, d: number, n: number, a?: number) {
  B(x, y, z, len, 0.35, d, a)
  for (let i = 0; i < n; i++) {
    const px = x - len / 2 + (i + 0.5) * (len / n)
    L([px, y + 0.18, z - d / 2], [px, y + 0.18, z + d / 2], a)
  }
}

/* --------------------------------------------------------------------------
   10 Robotics Models (Curriculum Hardware & Systems)
   -------------------------------------------------------------------------- */
type ModelDef = [string, string, () => void]

const MODELS: ModelDef[] = [
  [
    "Arduino Uno",
    "Microcontroller board",
    () => {
      B(0, 0, 0, 6.8, 0.15, 5.3)
      B(-3, 0.6, -1.2, 1.7, 1.1, 1.3)
      B(-3, 0.6, 1.5, 1.7, 1.1, 1)
      B(1, 0.25, 0.1, 3.2, 0.35, 0.9)
      B(-1.2, 0.3, 0.1, 0.9, 0.3, 1)
      H(0.3, 0.25, -2.4, 5, 0.4, 10)
      H(0.5, 0.25, 2.4, 4.2, 0.4, 8)
      R(2.9, 0.1, -1.2, 0.3, "y", 10, 1)
      B(2.4, 0.1, 1.2, 0.3, 0.1, 0.3, 1)
      B(2.9, 0.1, 0.8, 0.3, 0.1, 0.3, 1)
      for (const [x, z] of [
        [-3.1, -2],
        [-3.1, 2.2],
        [2.8, -2],
        [2.8, 2],
      ])
        R(x, 0, z, 0.2, "y", 8)
    },
  ],
  [
    "ESP32",
    "Wi-Fi + Bluetooth module",
    () => {
      B(0, 0, 0, 6, 0.15, 3.2)
      B(0.9, 0.3, 0, 2.2, 0.4, 1.8)
      B(2.85, 0.3, 0, 0.8, 0.45, 1.1)
      H(0.1, 0.3, -1.45, 4.6, 0.3, 15)
      H(0.1, 0.3, 1.45, 4.6, 0.3, 15)
      for (let i = 0; i < 6; i++) {
        const x = -2.9 + i * 0.35
        L([x, 0.1, -1.2], [x, 0.1, 1.2], 1)
        if (i < 5) L([x, 0.1, i % 2 ? -1.2 : 1.2], [x + 0.35, 0.1, i % 2 ? -1.2 : 1.2], 1)
      }
      B(2.1, 0.2, -0.8, 0.4, 0.2, 0.4, 1)
      B(2.1, 0.2, 0.8, 0.4, 0.2, 0.4, 1)
      R(-0.8, 0.1, 0, 0.25, "y", 10, 1, 0.1)
      for (const [x, z] of [
        [-2.7, -1.4],
        [-2.7, 1.4],
        [2.7, -1.4],
        [2.7, 1.4],
      ])
        R(x, 0, z, 0.14, "y", 8)
    },
  ],
  [
    "Servo Motor",
    "Precision rotary actuator",
    () => {
      B(0, 0, 0, 4, 3, 2)
      B(0, 0.5, 0, 5.8, 0.25, 1.9)
      R(-2.45, 0.5, 0, 0.2, "y", 8, 0, 0.14)
      R(2.45, 0.5, 0, 0.2, "y", 8, 0, 0.14)
      C(1, 1.9, 0, 0.55, 0.8, "y", 14)
      C(1, 2.5, 0, 0.2, 0.5, "y", 10, 1)
      B(1, 2.85, 0, 3, 0.15, 0.5, 1)
      R(-0.1, 2.95, 0, 0.1, "y", 8, 1)
      R(2.1, 2.95, 0, 0.1, "y", 8, 1)
      for (const z of [-0.4, 0, 0.4]) L([-2, -0.6, z], [-3.8, -0.9, z])
      B(-4, -0.9, 0, 0.4, 0.3, 1.2)
    },
  ],
  [
    "Ultrasonic Sensor",
    "HC-SR04 distance sensor",
    () => {
      B(0, 0, 0, 6.4, 3, 0.2)
      C(-1.6, 0, 0.6, 1.2, 0.9, "z", 20)
      C(1.6, 0, 0.6, 1.2, 0.9, "z", 20)
      R(-1.6, 0, 1.05, 0.8, "z", 16, 1)
      R(1.6, 0, 1.05, 0.8, "z", 16, 1)
      R(-1.6, 0, 1.05, 0.35, "z", 10, 1)
      R(1.6, 0, 1.05, 0.35, "z", 10, 1)
      B(0, 0.9, 0.2, 1, 0.5, 0.15)
      C(0, -0.4, 0.25, 0.2, 0.4, "z", 8, 1)
      H(0, -1.7, 0, 1.8, 0.3, 4)
    },
  ],
  [
    "Rover",
    "Four-wheel explorer",
    () => {
      B(0, 0.9, 0, 3.6, 0.5, 2.4)
      B(0, 1.4, 0.3, 2.6, 0.3, 1.4)
      for (const x of [-1.9, 1.9]) {
        for (const z of [-1.1, 1.1]) {
          C(x, 0.7, z, 0.7, 0.5, "x", 16)
          C(x, 0.7, z, 0.25, 0.6, "x", 8, 1)
          L([x, 0.7, z], [x, 1.4, z])
          L([x, 0.7, z], [x, 0, z])
        }
      }
      L([-1.9, 0.7, -1.1], [1.9, 0.7, -1.1])
      L([-1.9, 0.7, 1.1], [1.9, 0.7, 1.1])
      L([0, 1.55, -0.8], [0, 2.6, -0.8])
      B(0, 2.9, -0.8, 0.9, 0.6, 0.6, 1)
      R(0, 2.9, -0.5, 0.2, "z", 10, 1)
    },
  ],
  [
    "Humanoid Robot",
    "Bipedal companion",
    () => {
      B(0, 3.4, 0, 0.9, 0.8, 0.8)
      R(-0.2, 3.45, 0.41, 0.1, "z", 8, 1)
      R(0.2, 3.45, 0.41, 0.1, "z", 8, 1)
      C(0, 2.9, 0, 0.15, 0.3, "y", 8)
      L([0, 3.8, 0], [0, 4.3, 0])
      B(0, 4.4, 0, 0.2, 0.2, 0.2, 1)
      B(0, 2, 0, 1.5, 1.7, 0.8)
      R(0, 2.1, 0.41, 0.25, "z", 10, 1)
      B(0, 1, 0, 1.2, 0.35, 0.7)
      for (const s of [-1, 1]) {
        C(s * 0.95, 2.7, 0, 0.2, 0.5, "x", 8, 1)
        B(s * 1.1, 2.2, 0, 0.35, 1, 0.35)
        B(s * 1.1, 1.2, 0, 0.3, 0.9, 0.3)
        B(s * 1.1, 0.6, 0, 0.3, 0.3, 0.3)
        B(s * 0.4, 0.35, 0, 0.45, 0.9, 0.45)
        C(s * 0.4, -0.15, 0, 0.18, 0.6, "x", 8, 1)
        B(s * 0.4, -0.95, 0, 0.4, 1, 0.4)
        B(s * 0.4, -1.65, 0.2, 0.55, 0.2, 1)
      }
    },
  ],
  [
    "Robotic Arm",
    "3-axis manipulator",
    () => {
      C(0, 0, 0, 1.5, 0.5, "y", 20)
      C(0, 0.7, 0, 0.8, 0.9, "y", 16)
      C(0, 1.4, 0, 0.45, 1.1, "z", 12, 1)
      BM(0, 1.4, 1.5, 3.5, 0.5, 0.5)
      C(1.5, 3.5, 0, 0.4, 1.1, "z", 12, 1)
      BM(1.5, 3.5, 3.4, 3, 0.45, 0.45)
      C(3.4, 3, 0, 0.3, 0.8, "z", 10, 1)
      B(3.7, 2.95, 0, 0.4, 0.9, 0.7)
      B(4.2, 3.3, 0, 0.7, 0.15, 0.2)
      B(4.2, 2.6, 0, 0.7, 0.15, 0.2)
    },
  ],
  [
    "Stepper Motor",
    "NEMA 17 actuator",
    () => {
      B(0, 0, 0, 3.4, 3.4, 3)
      for (let k = 1; k < 5; k++) {
        const z = -1.5 + k * 0.6,
          a = 1.7
        L([-a, -a, z], [a, -a, z])
        L([a, -a, z], [a, a, z])
        L([a, a, z], [-a, a, z])
        L([-a, a, z], [-a, -a, z])
      }
      C(0, 0, 1.7, 1.1, 0.4, "z", 20)
      C(0, 0, 2.6, 0.25, 1.8, "z", 10, 1)
      L([0.25, 0, 1.7], [0.25, 0, 3.5], 1)
      for (const x of [-1.3, 1.3]) {
        for (const y of [-1.3, 1.3]) {
          R(x, y, 1.52, 0.18, "z", 8)
        }
      }
      B(0, 1.4, -1.8, 1.2, 0.5, 0.6)
    },
  ],
  [
    "Quadcopter",
    "Aerial robot",
    () => {
      B(0, 0, 0, 1.6, 0.5, 1.6)
      B(0, 0.5, 0, 1, 0.3, 0.7)
      C(0, -0.4, -0.9, 0.3, 0.4, "z", 10, 1)
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const x = sx * 3,
            z = sz * 3
          L([sx * 0.4, 0, sz * 0.5], [x, 0, z - sz * 0.1])
          L([sx * 0.5, 0, sz * 0.4], [x - sx * 0.1, 0, z])
          C(x, 0.1, z, 0.4, 0.5, "y", 12)
          R(x, 0.45, z, 1.5, "y", 24, 1)
          L([x - 1.5, 0.45, z], [x + 1.5, 0.45, z], 1)
          L([x, 0.45, z - 1.5], [x, 0.45, z + 1.5], 1)
          L([sx * 0.6, -0.25, sz * 0.6], [sx * 1.2, -1, sz * 1.2])
        }
      }
      L([-1.2, -1, -1.2], [-1.2, -1, 1.2])
      L([1.2, -1, -1.2], [1.2, -1, 1.2])
    },
  ],
  [
    "LiDAR Scanner",
    "360 range sensor",
    () => {
      C(0, -1.2, 0, 1.5, 0.6, "y", 24)
      C(0, -0.4, 0, 1.2, 1, "y", 24)
      C(0, 0.7, 0, 1.3, 1.2, "y", 24)
      R(0, 1.3, 0, 1.3, "y", 24, 1)
      C(0, 1.6, 0, 0.7, 0.4, "y", 16)
      B(0, 0.7, 1.4, 0.5, 0.45, 0.25, 1)
      B(0, 0.7, -1.4, 0.5, 0.45, 0.25, 1)
      B(0, -1.9, 0, 1.2, 0.3, 0.6)
      for (let i = 0; i < 4; i++) {
        const t = (i * PI) / 2 + 0.4
        R(Math.cos(t) * 1.2, -1.2, Math.sin(t) * 1.2, 0.12, "y", 6, 0, 0.3)
      }
    },
  ],
]

/* Normalize to a common size, then resample every model to the same segment count */
function build(fn: () => void) {
  W = []
  AC = []
  fn()
  const all = W.concat(AC)
  const mn = [1e9, 1e9, 1e9]
  const mx = [-1e9, -1e9, -1e9]
  for (let i = 0; i < all.length; i++) {
    const k = i % 3
    mn[k] = Math.min(mn[k], all[i])
    mx[k] = Math.max(mx[k], all[i])
  }
  const s = 1.9 / Math.max(...mx.map((v, k) => (v - mn[k]) / 2))
  const c = mn.map((v, k) => (v + mx[k]) / 2)
  const f = (a: number[]) => Float32Array.from(a, (v, i) => (v - c[i % 3]) * s)
  return { w: f(W), a: f(AC) }
}

const built = MODELS.map((m) => build(m[2]))
const NW = Math.max(...built.map((b) => b.w.length / 6))
const NA = Math.max(...built.map((b) => b.a.length / 6))

function rs(a: Float32Array, N: number) {
  const n = a.length / 6
  const o = new Float32Array(N * 6)
  if (!n) return o
  const ang = (i: number) => Math.atan2(a[i * 6 + 2] + a[i * 6 + 5], a[i * 6] + a[i * 6 + 3])
  const idx = [...Array(n).keys()].sort((i, j) => ang(i) - ang(j))
  for (let i = 0; i < N; i++) {
    const s = idx[Math.floor((i * n) / N)]
    for (let j = 0; j < 6; j++) o[i * 6 + j] = a[s * 6 + j]
  }
  return o
}

const SET = built.map((b) => ({ w: rs(b.w, NW), a: rs(b.a, NA) }))
const rnd = (n: number) => {
  const r = new Float32Array(n * 6)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < 3; j++) {
      r[i * 6 + j] = r[i * 6 + j + 3] = Math.random() * 2 - 1
    }
  }
  return r
}
const RW = rnd(NW)
const RA = rnd(NA)

function morph(
  A: Float32Array,
  Bm: Float32Array,
  out: Float32Array,
  rd: Float32Array,
  N: number,
  m: number
) {
  for (let i = 0; i < N; i++) {
    const k = Math.min(1, Math.max(0, m * 1.5 - (i / N) * 0.5))
    const e = k * k * (3 - 2 * k)
    const s = Math.sin(PI * e) * 1.3
    for (let j = 0; j < 6; j++) {
      const x = i * 6 + j
      out[x] = A[x] + (Bm[x] - A[x]) * e + rd[x] * s
    }
  }
}

/* --------------------------------------------------------------------------
   React Component: Robotics3DMorph
   -------------------------------------------------------------------------- */
export function Robotics3DMorph() {
  const stageRef = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const tagRef = useRef<HTMLParagraphElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)
  const activeIndexRef = useRef(0)
  const tmRef = useRef(0)

  useEffect(() => {
    const el = stageRef.current
    if (!el) return

    // ── Three.js SVG Scene Setup ──
    const renderer = new SVGRenderer()
    renderer.setClearColor(new THREE.Color(0xffffff), 0)
    renderer.sortObjects = false
    renderer.sortElements = false

    const svg = renderer.domElement
    svg.style.position = "absolute"
    svg.style.inset = "0"
    svg.style.width = "100%"
    svg.style.height = "100%"
    svg.style.background = "transparent"
    svg.style.backgroundColor = "transparent"
    el.appendChild(svg)

    const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
    cam.position.set(0, 1.2, 10.5)
    cam.lookAt(0, 0, 0)

    const scene = new THREE.Scene()
    const grp = new THREE.Group()
    scene.add(grp)

    // U-Fill Brand Blue line materials
    const mW = new THREE.LineBasicMaterial({
      color: 0x0026ff,
      transparent: true,
      opacity: 0.95,
      linewidth: 1.3,
    })
    const mA = new THREE.LineBasicMaterial({
      color: 0x0026ff,
      linewidth: 1.9,
    })

    const outW = new Float32Array(NW * 6)
    const outA = new Float32Array(NA * 6)

    function mkLines(arr: Float32Array, mat: THREE.LineBasicMaterial) {
      const g = new THREE.BufferGeometry()
      g.setAttribute("position", new THREE.BufferAttribute(arr, 3))
      const o = new THREE.LineSegments(g, mat)
      o.frustumCulled = false
      grp.add(o)
      return o
    }

    const linesW = mkLines(outW, mW)
    const linesA = mkLines(outA, mA)

    function fit() {
      if (!el) return
      const w = el.clientWidth || 1
      const h = el.clientHeight || 1
      renderer.setSize(w, h)
      cam.aspect = w / h
      cam.updateProjectionMatrix()
    }

    const ro = new ResizeObserver(fit)
    ro.observe(el)
    fit()

    // ── Label & Dots UI updates ──
    let shown = -1
    function updateLabel(i: number) {
      if (i === shown) return
      shown = i
      activeIndexRef.current = i

      const h = nameRef.current
      const t = tagRef.current
      const num = numRef.current
      const dotsEl = dotsRef.current

      if (h && t) {
        h.style.opacity = "0"
        t.style.opacity = "0"
        setTimeout(() => {
          if (h && t) {
            h.textContent = MODELS[i][0]
            t.textContent = MODELS[i][1]
            h.style.opacity = "1"
            t.style.opacity = "0.75"
          }
        }, 140)
      }

      if (num) {
        num.textContent = `${String(i + 1).padStart(2, "0")} / ${String(MODELS.length).padStart(2, "0")}`
      }

      if (dotsEl) {
        const dots = dotsEl.children
        for (let k = 0; k < dots.length; k++) {
          const dot = dots[k] as HTMLElement
          if (k === i) {
            dot.className =
              "h-1.5 w-5 rounded-full bg-brand transition-all duration-300"
          } else {
            dot.className =
              "h-1.5 w-1.5 rounded-full bg-brand/20 hover:bg-brand/40 transition-all duration-300"
          }
        }
      }
    }

    // ── Animation Loop ──
    const HOLD = 3.8
    const MORPH = 1.2
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let last = performance.now()
    let spin = 0
    let vis = true
    let cache = -1
    let animId = 0

    const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting))
    io.observe(el)

    function frame(now: number) {
      animId = requestAnimationFrame(frame)
      if (!vis || document.hidden) {
        last = now
        return
      }

      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      tmRef.current += dt

      const tm = tmRef.current
      const cyc = tm % 5
      const cur = Math.floor(tm / 5) % MODELS.length
      const nxt = (cur + 1) % MODELS.length
      const m = cyc < HOLD ? 0 : (cyc - HOLD) / MORPH

      spin += dt * (0.35 + (reduce ? 0 : 8 * Math.sin(PI * m)))
      grp.rotation.set(0.28 + Math.sin(tm * 0.5) * 0.07, spin, 0)

      if (m > 0) {
        morph(SET[cur].w, SET[nxt].w, outW, RW, NW, m)
        morph(SET[cur].a, SET[nxt].a, outA, RA, NA, m)
        linesW.geometry.attributes.position.needsUpdate = true
        linesA.geometry.attributes.position.needsUpdate = true
        cache = -1
      } else if (cache !== cur) {
        outW.set(SET[cur].w)
        outA.set(SET[cur].a)
        linesW.geometry.attributes.position.needsUpdate = true
        linesA.geometry.attributes.position.needsUpdate = true
        cache = cur
      }

      updateLabel(m > 0.4 ? nxt : cur)
      renderer.render(scene, cam)
      svg.style.backgroundColor = "transparent"
    }

    animId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      io.disconnect()
      linesW.geometry.dispose()
      linesA.geometry.dispose()
      mW.dispose()
      mA.dispose()
      svg.remove()
    }
  }, [])

  return (
    <div className="relative w-full max-w-[460px] mx-auto select-none flex flex-col items-center">
      {/* 3D Wireframe SVG Stage */}
      <div
        ref={stageRef}
        id="stage"
        className="relative w-full aspect-square flex items-center justify-center overflow-hidden bg-transparent"
        style={{ cursor: "grab" }}
        title="Interactive 3D Robotics SVG wireframe"
      />

      {/* Model Metadata Chip (Small typography, NOT Anton) */}
      <div className="w-full flex flex-col items-center text-center gap-1.5 pt-2">
        {/* Index counter */}
        <div
          ref={numRef}
          className="font-mono text-[11px] font-semibold text-brand tracking-widest uppercase"
        >
          01 / 10
        </div>

        {/* Model Name */}
        <h3
          ref={nameRef}
          className="font-sans text-base sm:text-lg font-bold tracking-tight text-ink leading-tight transition-opacity duration-200"
        >
          {MODELS[0][0]}
        </h3>

        {/* Model Tagline */}
        <p
          ref={tagRef}
          className="font-mono text-xs text-ink/65 transition-opacity duration-200"
        >
          {MODELS[0][1]}
        </p>

        {/* 10 Navigation Dots */}
        <div ref={dotsRef} className="flex items-center gap-1.5 pt-1.5">
          {MODELS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                tmRef.current = i * 5
              }}
              aria-label={`Jump to model ${i + 1}`}
              className={
                i === 0
                  ? "h-1.5 w-5 rounded-full bg-brand transition-all duration-300"
                  : "h-1.5 w-1.5 rounded-full bg-brand/20 hover:bg-brand/40 transition-all duration-300 cursor-pointer"
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Robotics3DMorph
