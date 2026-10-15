import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export interface Specializations3DCanvasHandle {
  setStage: (stage: number) => void;
}

export interface Specializations3DCanvasProps {
  currentStage?: number; // 0 to 5 (can be a float during continuous scroll, or integer)
  onStageSelect?: (index: number) => void;
  className?: string;
  isAutoPlaying?: boolean;
  showDots?: boolean;
}

const COUNT = 6;
const N = 520; // Number of morphing blocks

export const Specializations3DCanvas = forwardRef<
  Specializations3DCanvasHandle,
  Specializations3DCanvasProps
>(function Specializations3DCanvas(
  {
    currentStage = 0,
    onStageSelect,
    className = "",
    showDots = false,
  },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    currentStage,
    targetStage: currentStage,
    smoothStage: currentStage,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      setStage: (stage: number) => {
        stateRef.current.targetStage = stage;
      },
    }),
    []
  );

  // Keep stateRef in sync with incoming prop
  useEffect(() => {
    stateRef.current.targetStage = currentStage;
  }, [currentStage]);

  useEffect(() => {
    let isCancelled = false;
    let animId: number;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Ensure THREE is available
    const getThree = (): Promise<any> => {
      if ((window as any).THREE) return Promise.resolve((window as any).THREE);
      return new Promise((resolve) => {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if ((window as any).THREE) {
            clearInterval(interval);
            resolve((window as any).THREE);
          } else if (attempts > 30) {
            clearInterval(interval);
            // Fallback load script dynamically
            const s = document.createElement("script");
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
            s.onload = () => resolve((window as any).THREE);
            s.onerror = () => {
              const s2 = document.createElement("script");
              s2.src = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js";
              s2.onload = () => resolve((window as any).THREE);
              s2.onerror = () => resolve(null);
              document.head.appendChild(s2);
            };
            document.head.appendChild(s);
          }
        }, 60);
      });
    };

    getThree()
      .then((THREE) => {
        if (!THREE || isCancelled || !canvasRef.current || !containerRef.current) return;

      const rand = (() => {
        let s = 20261001;
        return () => {
          s |= 0;
          s = (s + 0x6d2b79f5) | 0;
          let t = Math.imul(s ^ (s >>> 15), 1 | s);
          t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      })();

      const P = (
        x: number,
        y: number,
        z: number,
        w: number,
        h: number,
        d: number,
        rx = 0,
        ry = 0,
        rz = 0,
        tone = 0.5
      ) => ({
        p: new THREE.Vector3(x, y, z),
        s: new THREE.Vector3(w, h, d),
        r: new THREE.Euler(rx, ry, rz),
        tone,
      });

      /* 1 ─ AI : voxel brain with cerebellum, stem and floating neural nodes */
      function shapeAI() {
        const a: any[] = [];
        const CELL = 0.55;

        // Two hemispheres (fissure down the middle) with a wavy "gyri" surface
        const inside = (i: number, j: number, k: number) => {
          const x = i * CELL;
          const y = j * CELL;
          const z = k * CELL;
          if (Math.abs(x) < 0.2) return false;
          if (y < -1.5) return false;
          const fold = 0.09 * Math.sin(2.3 * x + 1.2 * z) * Math.cos(2.1 * y + 1.5 * z);
          const r2 = (x / 3.2) ** 2 + ((y - 0.3) / 2.25) ** 2 + (z / 2.9) ** 2;
          return r2 <= 1 + fold;
        };

        // Hollow shell: keep only cells touching the outside
        for (let i = -8; i <= 8; i++)
          for (let j = -5; j <= 6; j++)
            for (let k = -7; k <= 7; k++) {
              if (!inside(i, j, k)) continue;
              const edge =
                !inside(i + 1, j, k) ||
                !inside(i - 1, j, k) ||
                !inside(i, j + 1, k) ||
                !inside(i, j - 1, k) ||
                !inside(i, j, k + 1) ||
                !inside(i, j, k - 1);
              if (!edge) continue;
              const x = i * CELL;
              const y = j * CELL;
              const z = k * CELL;
              const groove = 0.5 + 0.5 * Math.sin(2.3 * x + 1.2 * z) * Math.cos(2.1 * y + 1.5 * z);
              const tone = Math.min(
                1,
                Math.max(0, 0.3 + 0.3 * groove + 0.12 * (z / 2.9) + 0.1 * (y / 2.2))
              );
              a.push(P(x, y, z, CELL, CELL, CELL, 0, 0, 0, tone));
            }

        // Cerebellum: two rows of blocks at the back-bottom
        for (let c = -2; c <= 2; c++)
          for (let r = 0; r < 2; r++)
            a.push(P(c * 0.55, -1.75 - r * 0.42, -2.5, 0.5, 0.4, 0.9, 0, 0, 0, 0.22 + 0.1 * r));

        // Brain stem
        for (let s = 0; s < 4; s++)
          a.push(P(0, -2.0 - s * 0.5, -0.4 - s * 0.15, 0.55, 0.5, 0.55, 0, 0, 0, 0.18));

        // Floating neural nodes (bright diamonds) linked to each other and the cortex
        const nodes: [number, number, number][] = [
          [-2.4, 3.3, 0.6],
          [0.2, 4.0, -0.6],
          [2.5, 3.2, 0.9],
          [0.9, 3.5, 2.0],
        ];
        nodes.forEach(([x, y, z], idx) => {
          a.push(P(x, y, z, 0.32, 0.32, 0.32, 0.6, 0.785, 0, 1));
          a.push(P(x, y - 0.6, z, 0.06, 1.0, 0.06, 0, 0, 0, 0.85));
          const nx = nodes[(idx + 1) % nodes.length];
          const dx = nx[0] - x;
          const dz = nx[2] - z;
          a.push(
            P((x + nx[0]) / 2, (y + nx[1]) / 2, (z + nx[2]) / 2, Math.hypot(dx, dz), 0.06, 0.06, 0, -Math.atan2(dz, dx), 0, 0.9)
          );
        });

        return a;
      }

      /* 2 ─ Robotics : humanoid */
      function shapeRobot() {
        const a: any[] = [];
        a.push(P(0, 3.6, 0, 1.5, 1.3, 1.3, 0, 0, 0, 0.7));
        a.push(P(0, 3.65, 0.62, 1.1, 0.4, 0.15, 0, 0, 0, 0.08));
        a.push(P(-0.3, 3.65, 0.72, 0.22, 0.22, 0.1, 0, 0, 0, 1));
        a.push(P(0.3, 3.65, 0.72, 0.22, 0.22, 0.1, 0, 0, 0, 1));
        a.push(P(0, 4.45, 0, 0.1, 0.6, 0.1, 0, 0, 0, 0.6));
        a.push(P(0, 4.9, 0, 0.3, 0.3, 0.3, 0, 0.785, 0, 1));
        a.push(P(0, 2.85, 0, 0.5, 0.4, 0.5, 0, 0, 0, 0.3));
        a.push(P(0, 1.6, 0, 2.2, 2.0, 1.2, 0, 0, 0, 0.5));
        a.push(P(0, 1.9, 0.62, 1.2, 0.8, 0.12, 0, 0, 0, 0.85));
        a.push(P(0, 1.9, 0.7, 0.4, 0.4, 0.1, 0, 0.785, 0, 1));
        a.push(P(0, 1.7, -0.85, 1.4, 1.6, 0.5, 0, 0, 0, 0.3));
        a.push(P(0, 0.45, 0, 1.4, 0.4, 0.9, 0, 0, 0, 0.25));
        a.push(P(0, 0, 0, 1.8, 0.7, 1.0, 0, 0, 0, 0.5));
        [-1, 1].forEach((s) => {
          a.push(P(s * 1.5, 2.3, 0, 0.85, 0.85, 0.85, 0, 0, 0, 0.8));
          a.push(P(s * 1.65, 1.25, 0, 0.55, 1.4, 0.55, 0, 0, -s * 0.08, 0.5));
          a.push(P(s * 1.7, 0.5, 0, 0.62, 0.62, 0.62, 0, 0, 0, 0.25));
          a.push(P(s * 1.75, -0.4, 0.2, 0.5, 1.2, 0.5, -0.3, 0, -s * 0.05, 0.55));
          a.push(P(s * 1.78, -1.1, 0.5, 0.6, 0.5, 0.6, 0, 0, 0, 0.9));
          a.push(P(s * 0.6, -0.7, 0, 0.7, 0.5, 0.7, 0, 0, 0, 0.3));
          a.push(P(s * 0.6, -1.55, 0, 0.7, 1.3, 0.75, 0, 0, 0, 0.5));
          a.push(P(s * 0.6, -2.3, 0.05, 0.8, 0.5, 0.8, 0, 0, 0, 0.25));
          a.push(P(s * 0.6, -3.15, 0, 0.65, 1.4, 0.7, 0, 0, 0, 0.55));
          a.push(P(s * 0.6, -4.0, 0.4, 0.9, 0.45, 1.5, 0, 0, 0, 0.85));
        });
        return a;
      }

      /* 3 ─ IoT : extruded wifi signal + connected devices */
      function shapeIoT() {
        const a: any[] = [];
        const cy = -1.6;
        a.push(P(0, cy, 0, 1, 1, 1, 0, 0.785, 0, 1));
        const span = Math.PI * 0.56;
        [
          [1.9, 9],
          [3.1, 13],
          [4.3, 17],
        ].forEach(([r, n], ai) => {
          for (let k = 0; k < n; k++) {
            const th = -span / 2 + (span * (k + 0.5)) / n;
            a.push(
              P(
                r * Math.sin(th),
                cy + r * Math.cos(th),
                0,
                ((r * span) / n) * 1.05,
                0.6,
                0.7,
                0,
                0,
                -th,
                0.4 + ai * 0.22
              )
            );
          }
        });
        a.push(P(0, cy - 1.3, 0, 7.4, 0.35, 2.6, 0, 0, 0, 0.22));
        a.push(P(0, cy - 0.8, 0, 0.5, 0.6, 0.5, 0, 0, 0, 0.5));
        [-1, 1].forEach((s) => {
          a.push(P(s * 3.1, cy - 0.67, 0, 0.9, 0.9, 0.9, 0, 0.4, 0, 0.9));
          a.push(P(s * 1.65, cy - 0.9, 0, 2.2, 0.07, 0.07, 0, 0, 0, 1));
        });
        return a;
      }

      /* 4 ─ App development : smartphone with UI blocks */
      function shapeApp() {
        const a: any[] = [];
        a.push(P(0, 0, 0, 2.9, 5.6, 0.4, 0, 0, 0, 0.25));
        a.push(P(0, 0, 0.22, 2.6, 5.2, 0.08, 0, 0, 0, 0.72));
        a.push(P(0, 2.35, 0.3, 0.7, 0.18, 0.08, 0, 0, 0, 0.05));
        for (let c = 0; c < 3; c++)
          for (let r = 0; r < 4; r++) {
            a.push(
              P(
                -0.85 + c * 0.85,
                1.4 - r * 0.95,
                0.36,
                0.62,
                0.62,
                0.16 + ((c + r) % 3) * 0.07,
                0,
                0,
                0,
                0.45 + ((c * 3 + r) % 4) * 0.14
              )
            );
          }
        a.push(P(0, -2.2, 0.3, 2.3, 0.5, 0.1, 0, 0, 0, 0.5));
        for (let k = 0; k < 4; k++)
          a.push(P(-0.85 + k * 0.57, -2.2, 0.4, 0.38, 0.38, 0.1, 0, 0, 0, 0.95));
        a.push(P(1.5, 0.8, 0, 0.1, 0.8, 0.2, 0, 0, 0, 0.2));
        a.push(P(-1.5, 0.9, 0, 0.1, 0.5, 0.2, 0, 0, 0, 0.2));
        a.push(P(-3.1, 1.4, 0.9, 1.9, 1.2, 0.12, 0, 0.45, 0, 0.9));
        a.push(P(-3.1, 1.4, 1.0, 1.2, 0.16, 0.1, 0, 0.45, 0, 0.45));
        a.push(P(3.1, -1.1, 1.0, 1.9, 1.2, 0.12, 0, -0.45, 0, 0.9));
        a.push(P(3.1, -1.1, 1.1, 1.2, 0.16, 0.1, 0, -0.45, 0, 0.45));
        return a;
      }

      /* 5 ─ Web : browser window + code brackets */
      function shapeWeb() {
        const a: any[] = [];
        a.push(P(0, 0, -0.3, 6.4, 4.4, 0.3, 0, 0, 0, 0.25));
        a.push(P(0, 1.85, -0.1, 6.2, 0.5, 0.15, 0, 0, 0, 0.6));
        [-2.7, -2.35, -2.0].forEach((x) =>
          a.push(P(x, 1.85, 0.05, 0.2, 0.2, 0.1, 0, 0, 0, 1))
        );
        a.push(P(0.4, 1.85, 0.05, 3.3, 0.26, 0.08, 0, 0, 0, 0.92));
        a.push(P(0, 0.55, -0.1, 5.8, 1.5, 0.12, 0, 0, 0, 0.78));
        a.push(P(-1.8, 0.8, 0.0, 2.2, 0.18, 0.08, 0, 0, 0, 1));
        a.push(P(-2.1, 0.4, 0.0, 1.6, 0.12, 0.08, 0, 0, 0, 1));
        a.push(P(2.0, 0.5, 0.0, 1.1, 0.4, 0.1, 0, 0, 0, 0.4));
        for (let i = 0; i < 3; i++) {
          a.push(P(-1.95 + i * 1.95, -1.0, -0.1, 1.75, 1.35, 0.15, 0, 0, 0, 0.68));
          a.push(P(-1.95 + i * 1.95, -0.75, 0.0, 1.45, 0.65, 0.12, 0, 0, 0, 0.95));
        }
        a.push(P(0, -1.95, -0.1, 5.8, 0.2, 0.1, 0, 0, 0, 0.5));
        // < / >
        const z = 1.7;
        const t = 0.36;
        a.push(P(-2.4, 0.5, z, 1.4, t, t, 0, 0, 0.785, 0.95));
        a.push(P(-2.4, -0.5, z, 1.4, t, t, 0, 0, -0.785, 0.95));
        a.push(P(0, 0, z, t, 2.2, t, 0, 0, -0.3, 0.95));
        a.push(P(2.4, 0.5, z, 1.4, t, t, 0, 0, -0.785, 0.95));
        a.push(P(2.4, -0.5, z, 1.4, t, t, 0, 0, 0.785, 0.95));
        return a;
      }

      /* 6 ─ Drone : quadcopter */
      function shapeDrone() {
        const a: any[] = [];
        a.push(P(0, 0, 0, 1.7, 0.6, 1.7, 0, 0, 0, 0.4));
        a.push(P(0, 0.45, 0, 1.2, 0.3, 1.2, 0, 0.785, 0, 0.7));
        a.push(P(0, 0.7, 0, 0.5, 0.2, 0.5, 0, 0, 0, 1));
        a.push(P(0, -0.55, 0.55, 0.7, 0.7, 0.7, 0, 0, 0, 0.2));
        a.push(P(0, -0.55, 0.95, 0.35, 0.35, 0.2, 0, 0, 0, 0.05));
        a.push(P(0, -0.45, -0.45, 1.1, 0.35, 1.0, 0, 0, 0, 0.3));
        for (let k = 0; k < 4; k++) {
          const ang = Math.PI / 4 + (k * Math.PI) / 2;
          const dx = Math.cos(ang);
          const dz = Math.sin(ang);
          const mx = dx * 3.4;
          const mz = dz * 3.4;
          const ph = k % 2 ? 0.6 : -0.6;
          a.push(P(dx * 1.9, 0.05, dz * 1.9, 3.0, 0.28, 0.42, 0, -ang, 0, 0.45));
          a.push(P(mx, 0.25, mz, 0.85, 0.6, 0.85, 0, 0, 0, 0.25));
          a.push(P(mx, 0.7, mz, 0.25, 0.25, 0.25, 0, 0, 0, 1));
          a.push(P(mx, 0.82, mz, 3.2, 0.07, 0.38, 0, -ang + ph, 0, 0.9));
          a.push(P(mx, 0.9, mz, 3.2, 0.07, 0.38, 0, -ang + ph + 1.5708, 0, 0.8));
        }
        [-1, 1].forEach((sx) =>
          [-1, 1].forEach((sz) => {
            a.push(
              P(
                sx * 1.1,
                -1.0,
                sz * 0.95,
                0.16,
                1.0,
                0.16,
                -sz * 0.25,
                0,
                sx * 0.25,
                0.5
              )
            );
          })
        );
        [-1, 1].forEach((s) => a.push(P(0, -1.55, s * 1.3, 3.4, 0.14, 0.2, 0, 0, 0, 0.6)));
        return a;
      }

      function fit(parts: any[], size = 6.6) {
        const mn = new THREE.Vector3(1e9, 1e9, 1e9);
        const mx = new THREE.Vector3(-1e9, -1e9, -1e9);
        const v = new THREE.Vector3();
        parts.forEach((q) => {
          for (let i = 0; i < 8; i++) {
            v.set(
              (i & 1 ? 0.5 : -0.5) * q.s.x,
              (i & 2 ? 0.5 : -0.5) * q.s.y,
              (i & 4 ? 0.5 : -0.5) * q.s.z
            )
              .applyEuler(q.r)
              .add(q.p);
            mn.min(v);
            mx.max(v);
          }
        });
        const c = mn.clone().add(mx).multiplyScalar(0.5);
        const k = size / Math.max(mx.x - mn.x, mx.y - mn.y, mx.z - mn.z);
        parts.forEach((q) => {
          q.p.sub(c).multiplyScalar(k);
          q.s.multiplyScalar(k);
        });
        return parts;
      }

      function normalize(parts: any[]) {
        const arr = parts.slice();
        const vol = (q: any) => q.s.x * q.s.y * q.s.z;
        while (arr.length < N) {
          let bi = 0;
          let bv = -1;
          for (let i = 0; i < arr.length; i++) {
            const v = vol(arr[i]);
            if (v > bv) {
              bv = v;
              bi = i;
            }
          }
          const b = arr[bi];
          const ax = b.s.x >= b.s.y && b.s.x >= b.s.z ? "x" : b.s.y >= b.s.z ? "y" : "z";
          const half = b.s[ax] / 2;
          const off = new THREE.Vector3();
          off[ax] = half / 2;
          off.applyEuler(b.r);
          const s2 = b.s.clone();
          s2[ax] = half;
          const mk = (sign: number) => ({
            p: b.p.clone().addScaledVector(off, sign),
            s: s2.clone(),
            r: b.r.clone(),
            tone: b.tone,
          });
          arr.splice(bi, 1, mk(1), mk(-1));
        }
        while (arr.length > N) {
          let si = 0;
          let sv = 1e9;
          for (let i = 0; i < arr.length; i++) {
            const v = vol(arr[i]);
            if (v < sv) {
              sv = v;
              si = i;
            }
          }
          arr.splice(si, 1);
        }
        arr.forEach(
          (q: any) => (q.tone = Math.min(1, Math.max(0, q.tone + (rand() - 0.5) * 0.1)))
        );
        return arr;
      }

      const C0 = new THREE.Color("#1a3fc4");
      const C1 = new THREE.Color("#86a4ff");
      const tmpC = new THREE.Color();

      function pack(parts: any[]) {
        const key = (q: any) =>
          Math.floor((q.p.y + 20) / 0.8) * 10 +
          ((Math.atan2(q.p.z, q.p.x) + Math.PI) / (Math.PI * 2)) * 9.99;
        parts.sort((a, b) => key(a) - key(b));
        const pos = new Float32Array(N * 3);
        const scl = new Float32Array(N * 3);
        const rot = new Float32Array(N * 3);
        const col = new Float32Array(N * 3);
        parts.forEach((q, i) => {
          pos.set([q.p.x, q.p.y, q.p.z], i * 3);
          scl.set([q.s.x, q.s.y, q.s.z], i * 3);
          rot.set([q.r.x, q.r.y, q.r.z], i * 3);
          tmpC.copy(C0).lerp(C1, q.tone);
          col.set([tmpC.r, tmpC.g, tmpC.b], i * 3);
        });
        return { pos, scl, rot, col };
      }

      const SHAPES = [
        shapeAI,
        shapeRobot,
        shapeIoT,
        shapeApp,
        shapeWeb,
        shapeDrone,
      ].map((f) => pack(normalize(fit(f()))));

      const scatter = new Float32Array(N * 3);
      const twist = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const v = new THREE.Vector3(
          rand() - 0.5,
          rand() - 0.5,
          rand() - 0.5
        )
          .normalize()
          .multiplyScalar(0.6 + rand() * 1.1);
        scatter.set([v.x, v.y, v.z], i * 3);
        twist[i] = (rand() - 0.5) * 2.4;
      }

      // Three Scene Setup — capped DPR & optimized shadow maps for anti-lag 60/120fps
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;

      const scene = new THREE.Scene();
      scene.background = null; // Transparent background to blend into the section

      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 1.2, 13);
      camera.lookAt(0, 0, 0);

      scene.add(new THREE.HemisphereLight(0xffffff, 0xb4c3ff, 0.9));
      const sun = new THREE.DirectionalLight(0xffffff, 2.4);
      sun.position.set(6, 10, 7);
      sun.castShadow = true;
      sun.shadow.mapSize.set(512, 512);
      Object.assign(sun.shadow.camera, {
        left: -9,
        right: 9,
        top: 9,
        bottom: -9,
        near: 0.5,
        far: 40,
      });
      sun.shadow.bias = -0.0006;
      sun.shadow.normalBias = 0.03;
      scene.add(sun);

      const rim = new THREE.DirectionalLight(0x6f93ff, 1.2);
      rim.position.set(-8, 3, -6);
      scene.add(rim);

      const rig = new THREE.Group();
      scene.add(rig);
      const model = new THREE.Group();
      rig.add(model);

      // Soft grid floor
      const FLOOR_Y = -3.7;
      const grid = new THREE.GridHelper(30, 30, 0x9db4ff, 0xc9d6ff);
      grid.position.y = FLOOR_Y;
      grid.material.transparent = true;
      grid.material.opacity = 0.45;
      rig.add(grid);

      [
        [4.4, 4.5, 0.45],
        [6.2, 6.24, 0.25],
      ].forEach(([a, b, o]) => {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(a, b, 96),
          new THREE.MeshBasicMaterial({
            color: 0x4169e1,
            transparent: true,
            opacity: o,
          })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = FLOOR_Y + 0.01;
        rig.add(ring);
      });

      const catcher = new THREE.Mesh(
        new THREE.PlaneGeometry(32, 32),
        new THREE.ShadowMaterial({ color: 0x1a2f8a, opacity: 0.18 })
      );
      catcher.rotation.x = -Math.PI / 2;
      catcher.position.y = FLOOR_Y + 0.02;
      catcher.receiveShadow = true;
      rig.add(catcher);

      // Blocks
      const box = new THREE.BoxGeometry(1, 1, 1);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.36,
        metalness: 0.18,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      });
      const mesh = new THREE.InstancedMesh(box, mat, N);
      mesh.setColorAt(0, new THREE.Color(1, 1, 1));
      mesh.castShadow = true;
      mesh.frustumCulled = false;
      model.add(mesh);

      // Blueprint edge lines
      const edgeBase = new THREE.EdgesGeometry(box).attributes.position.array;
      const EV = edgeBase.length / 3;
      const edgePos = new Float32Array(N * EV * 3);
      const edgeGeo = new THREE.BufferGeometry();
      edgeGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(edgePos, 3).setUsage(THREE.DynamicDrawUsage)
      );
      const edges = new THREE.LineSegments(
        edgeGeo,
        new THREE.LineBasicMaterial({
          color: 0xdce7ff,
          transparent: true,
          opacity: 0.6,
        })
      );
      edges.frustumCulled = false;
      model.add(edges);

      const GAP = 0.94;
      const m4 = new THREE.Matrix4();
      const q4 = new THREE.Quaternion();
      const e4 = new THREE.Euler();
      const p3 = new THREE.Vector3();
      const s3 = new THREE.Vector3();
      const v3 = new THREE.Vector3();
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

      function morph(i0: number, T: number) {
        const A = SHAPES[i0];
        const B = SHAPES[Math.min(i0 + 1, COUNT - 1)];
        const ca = mesh.instanceColor.array;
        for (let i = 0; i < N; i++) {
          const k = i * 3;
          const d = i / (N - 1);
          const l = Math.min(1, Math.max(0, T * 1.5 - d * 0.5));
          const e = l * l * (3 - 2 * l);
          const s = Math.sin(Math.PI * l);
          p3.set(
            lerp(A.pos[k], B.pos[k], e) + scatter[k] * s * 1.2,
            lerp(A.pos[k + 1], B.pos[k + 1], e) + scatter[k + 1] * s * 1.2,
            lerp(A.pos[k + 2], B.pos[k + 2], e) + scatter[k + 2] * s * 1.2
          );
          const sc = GAP * (1 - 0.28 * s);
          s3.set(
            lerp(A.scl[k], B.scl[k], e) * sc,
            lerp(A.scl[k + 1], B.scl[k + 1], e) * sc,
            lerp(A.scl[k + 2], B.scl[k + 2], e) * sc
          );
          e4.set(
            lerp(A.rot[k], B.rot[k], e),
            lerp(A.rot[k + 1], B.rot[k + 1], e) + twist[i] * s,
            lerp(A.rot[k + 2], B.rot[k + 2], e)
          );
          q4.setFromEuler(e4);
          m4.compose(p3, q4, s3);
          mesh.setMatrixAt(i, m4);
          ca[k] = lerp(A.col[k], B.col[k], e);
          ca[k + 1] = lerp(A.col[k + 1], B.col[k + 1], e);
          ca[k + 2] = lerp(A.col[k + 2], B.col[k + 2], e);
          const o = i * EV * 3;
          for (let j = 0; j < EV; j++) {
            v3.set(
              edgeBase[j * 3] * 1.004,
              edgeBase[j * 3 + 1] * 1.004,
              edgeBase[j * 3 + 2] * 1.004
            ).applyMatrix4(m4);
            edgePos[o + j * 3] = v3.x;
            edgePos[o + j * 3 + 1] = v3.y;
            edgePos[o + j * 3 + 2] = v3.z;
          }
        }
        mesh.instanceMatrix.needsUpdate = true;
        mesh.instanceColor.needsUpdate = true;
        edgeGeo.attributes.position.needsUpdate = true;
      }

      // Initial morph
      morph(0, 0);

      // Handle Resize
      const resize = () => {
        if (!containerRef.current || !canvasRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        if (w <= 0 || h <= 0) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        const halfW =
          camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (w / h);
        rig.scale.setScalar(Math.min(1.0, Math.max(0.75, halfW / 4.5)));
      };

      resize();
      window.addEventListener("resize", resize);

      // Mouse Parallax Interaction
      let mx = 0;
      let my = 0;
      let px = 0;
      let py = 0;

      const onPointerMove = (e: PointerEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mx = ((e.clientX - rect.left) / rect.width - 0.5) * 1.2;
        my = ((e.clientY - rect.top) / rect.height - 0.5) * 1.2;
      };

      container.addEventListener("pointermove", onPointerMove);

      const smooth = (a: number, b: number, x: number) => {
        x = Math.min(1, Math.max(0, (x - a) / (b - a)));
        return x * x * (3 - 2 * x);
      };

      let lastKey = "";
      let isVisible = false;

      const render = (time: number) => {
        if (isCancelled || !isVisible) return;

        // Smoothly and responsively interpolate towards target stage
        // No extra easing here: ScrollTrigger's `scrub` already smooths the
        // progress. A second, frame-rate-dependent lerp made each morph finish
        // *after* the scroll had stopped, so the last shape never settled.
        const state = stateRef.current;
        state.smoothStage = state.targetStage;

        const fs = Math.min(COUNT - 1, Math.max(0, state.smoothStage));
        const i0 = Math.min(COUNT - 2, Math.floor(fs + 1e-6));
        const T = smooth(0.08, 0.78, Math.min(1, fs - i0));
        const key = i0 + ":" + T.toFixed(3);
        if (key !== lastKey) {
          morph(i0, T);
          lastKey = key;
        }

        px += (mx - px) * 0.06;
        py += (my - py) * 0.06;

        // Bounded turn, not an ever-growing spin: each stage settles at a fixed,
        // readable angle (never tipped over), with a gentle idle sway on top.
        model.rotation.y = Math.sin((fs * Math.PI) / 2) * 0.7 + Math.sin(time * 0.0008) * 0.12 + px * 0.35;
        model.rotation.x = 0.15 + py * 0.2;
        model.position.y = Math.sin(time * 0.0012) * 0.1;

        renderer.render(scene, camera);
        animId = requestAnimationFrame(render);
      };

      // Intersection Observer: stop rendering when off-screen to save 100% of GPU/CPU
      const io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          const wasVisible = isVisible;
          isVisible = entry.isIntersecting;
          if (isVisible && !wasVisible) {
            resize();
            cancelAnimationFrame(animId);
            animId = requestAnimationFrame(render);
          } else if (!isVisible && wasVisible) {
            cancelAnimationFrame(animId);
          }
        },
        { threshold: 0.02, rootMargin: "200px 0px" }
      );
      io.observe(container);

      setIsLoaded(true);

      return () => {
        io.disconnect();
        window.removeEventListener("resize", resize);
        container.removeEventListener("pointermove", onPointerMove);
        cancelAnimationFrame(animId);
        renderer.dispose();
      };
    }).catch((err) => {
      console.warn("Could not initialize 3D canvas:", err);
    });

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[260px] sm:min-h-[320px] flex items-center justify-center overflow-hidden select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* Subtle Blueprint Radial Ambience */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(65,105,225,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Interactive Dots Strip */}
      {showDots && (
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full border border-ink/10 bg-white/80 backdrop-blur-sm px-3 py-1.5 shadow-sm">
          {Array.from({ length: COUNT }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Jump to stage 0${idx + 1}`}
              onClick={() => onStageSelect?.(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                Math.round(currentStage) === idx
                  ? "w-6 bg-brand shadow-[0_0_8px_rgba(0,38,255,0.4)]"
                  : "w-2.5 bg-ink/20 hover:bg-ink/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Loading overlay if Three.js is initializing */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs font-mono text-mute">
            <span className="h-2 w-2 rounded-full bg-brand animate-ping" />
            <span>Initializing 3D Core...</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default Specializations3DCanvas;