import { useEffect, useRef, useState, useCallback, type MouseEvent } from "react"
import { ScrollTrigger } from "@/lib/gsap"
import { cn } from "@/lib/utils"

export interface EmergingImageProps {
  src: string
  alt: string
  className?: string
  containerClassName?: string
  /** Reveal angle in degrees: 0 (left-right), 45 (diagonal BL-TR), 90 (bottom-top), 135 (diagonal TL-BR), 180 (right-left), etc. */
  angle?: number
  /** Leading edge sweep fill color, defaults to U-Fill brand blue (#0026ff) */
  fillColor?: string
  /** Animation duration in seconds (default: 1.35s) */
  duration?: number
  /** Delay before trigger in seconds */
  delay?: number
  /** Effect variation: 3 = Stochastic Dither Noise Pixel Dissolve (Codrops Demo 3), 1 = Coarse-to-fine square pixel wipe (Codrops Demo 1) */
  effect?: 1 | 3
  /** Re-trigger reveal on hover */
  hoverReplay?: boolean
  /** Priority eager loading */
  priority?: boolean
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
}

const VS_SOURCE = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = (aPosition + 1.0) * 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const FS_SOURCE = `
precision highp float;

uniform sampler2D uTexture;
uniform float uProgress;
uniform float uAngle;
uniform float uEffect;
uniform vec3 uFillColor;
uniform vec2 uElementSize;
uniform vec2 uTextureSize;

varying vec2 vUv;

// Helpers from Akella / Codrops EmergingImages
float mapVal(float value, float min1, float max1, float min2, float max2) {
  float val = min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  return clamp(val, min2, max2);
}

float cubicOut(float t) {
  float f = t - 1.0;
  return f * f * f + 1.0;
}

float quadraticOut(float t) {
  return -t * (t - 2.0);
}

float cubicInOut(float t) {
  return t < 0.5
    ? 4.0 * t * t * t
    : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
}

vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
  return (blend * opacity + base * (1.0 - opacity));
}

// Hash without sine function (from Dave_Hoskins / Akella EmergeMaterial)
float hashwithoutsine12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Analytical square PristineGrid calculation for ultra-lightweight zero-lag performance
float calcPristineGrid(vec2 uv, vec2 lineWidth, vec2 uvDeriv) {
  bool invertLine = lineWidth.x > 0.5;
  vec2 targetWidth = invertLine ? vec2(1.0) - lineWidth : lineWidth;
  vec2 drawWidth = clamp(targetWidth, uvDeriv, vec2(0.5));
  vec2 lineAA = max(uvDeriv, 0.000001) * 4.0;
  vec2 gridUV = abs(fract(uv) * 2.0 - 1.0);
  gridUV = invertLine ? gridUV : 1.0 - gridUV;
  vec2 grid2 = smoothstep(drawWidth + lineAA, drawWidth - lineAA, gridUV);
  grid2 *= clamp(targetWidth / drawWidth, 0.0, 1.0);
  grid2 = mix(grid2, targetWidth, clamp(uvDeriv * 2.0 - vec2(1.0), vec2(0.0), vec2(1.0)));
  grid2 = invertLine ? 1.0 - grid2 : grid2;
  return mix(grid2.x, 1.0, grid2.y);
}

void main() {
  // Texture cover math (simulates CSS object-cover)
  vec2 uv = vUv - vec2(0.5);
  float aspectTex = uTextureSize.x / max(uTextureSize.y, 0.001);
  float aspectElem = uElementSize.x / max(uElementSize.y, 0.001);
  if (aspectTex > aspectElem) {
    uv *= vec2(aspectElem / aspectTex, 1.0);
  } else {
    uv *= vec2(1.0, aspectTex / aspectElem);
  }
  uv += vec2(0.5);

  vec4 defaultColor = texture2D(uTexture, uv);

  if (uEffect >= 2.5) {
    // ══════════════════════════════════════════════════════════════════
    // EFFECT 3: Codrops Stochastic Dither Noise Pixel Dissolve
    // Dense square pixel dither with two-phase brand blue wavefront
    // ══════════════════════════════════════════════════════════════════
    float s = 110.0;
    vec2 gridSize = vec2(s, floor(s / aspectElem));
    vec2 newUV = floor(uv * gridSize);
    float pattern = hashwithoutsine12(newUV);

    // Directional sweep coordinate along the requested angle
    vec2 dir = vec2(cos(uAngle), sin(uAngle));
    float denom = abs(dir.x) + abs(dir.y);
    float coord = dot(vUv - vec2(0.5), dir) / max(denom, 0.001) + 0.5;
    float sweepVal = 1.0 - coord;

    float w = 0.45;
    float p0 = clamp(uProgress / 0.82, 0.0, 1.0);
    float p1 = clamp((uProgress - 0.18) / 0.82, 0.0, 1.0);

    p0 = mapVal(p0, 0.0, 1.0, -w, 1.0);
    p0 = smoothstep(p0, p0 + w, sweepVal);
    float p0_ = clamp(1.0 - 2.0 * p0 + pattern, 0.0, 1.0);

    p1 = mapVal(p1, 0.0, 1.0, -w, 1.0);
    p1 = smoothstep(p1, p1 + w, sweepVal);
    float p1_ = clamp(1.0 - 2.0 * p1 + pattern, 0.0, 1.0);

    if (p0_ <= 0.001) {
      discard;
    }

    vec3 finalColor = mix(uFillColor, defaultColor.rgb, p1_);
    finalColor = pow(finalColor, vec3(1.0 / 2.2));

    gl_FragColor = vec4(finalColor, p0_);
  } else {
    // ══════════════════════════════════════════════════════════════════
    // EFFECT 1: Coarse-to-Fine Square Pixelation + PristineGrid Wireframe
    // ══════════════════════════════════════════════════════════════════
    float pixelateProgress = mapVal(uProgress, 0.22, 1.0, 0.0, 1.0);
    pixelateProgress = floor(pixelateProgress * 14.0) / 14.0;
    float s = floor(mix(12.0, 60.0, quadraticOut(pixelateProgress)));
    vec2 gridSize = vec2(s, floor(s / aspectElem));

    vec2 newUV = floor(uv * gridSize) / gridSize + 0.5 / gridSize;
    vec4 pixelColor = texture2D(uTexture, newUV);
    float finalProgress = mapVal(uProgress, 0.72, 1.0, 0.0, 1.0);
    vec4 color = mix(pixelColor, defaultColor, finalProgress);

    vec2 uvDeriv = gridSize / max(uElementSize, vec2(1.0));
    float lineWidthVal = 0.22 * (1.0 - uProgress);
    float lines = calcPristineGrid(uv * gridSize, vec2(lineWidthVal), uvDeriv);

    vec2 dir = vec2(cos(uAngle), sin(uAngle));
    float denom = abs(dir.x) + abs(dir.y);
    float coord = dot(vUv - vec2(0.5), dir) / max(denom, 0.001) + 0.5;

    float discardProgress = mapVal(uProgress, 0.0, 0.85, 0.0, 1.0);
    if (coord > cubicOut(discardProgress)) {
      discard;
    }

    float gradWidth = mix(0.35, 0.12, uProgress);
    float customProg = mapVal(cubicInOut(uProgress), 0.0, 1.0, -gradWidth, 1.0 - gradWidth);
    float fillGradient = smoothstep(customProg, customProg + gradWidth, coord);

    vec3 rgb = blendNormal(vec3(1.0 - lines), color.rgb, 0.9);
    rgb = mix(rgb, uFillColor, fillGradient);
    rgb = mix(rgb, defaultColor.rgb, finalProgress);
    rgb = pow(rgb, vec3(1.0 / 2.2));

    gl_FragColor = vec4(rgb, 1.0);
  }
}
`

function parseHexColor(hex: string): [number, number, number] {
  let clean = hex.replace("#", "")
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("")
  }
  const num = parseInt(clean, 16)
  if (isNaN(num)) return [0.0, 0.149, 1.0] // fallback to #0026ff
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255]
}

export function EmergingImage({
  src,
  alt,
  className,
  containerClassName,
  angle = 45,
  fillColor = "#0026ff",
  duration = 1.35,
  delay = 0,
  effect = 3,
  hoverReplay = true,
  priority = false,
  onClick,
}: EmergingImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const [isLoaded, setIsLoaded] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [fallbackToImg, setFallbackToImg] = useState(false)

  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const textureRef = useRef<WebGLTexture | null>(null)
  const uniformsRef = useRef<{ [key: string]: WebGLUniformLocation | null }>({})
  const textureSizeRef = useRef<[number, number]>([0, 0])
  const elementSizeRef = useRef<[number, number]>([0, 0])
  const progressRef = useRef(0)
  const rafIdRef = useRef<number | null>(null)
  const hasAnimatedRef = useRef(false)

  // Render a single frame with WebGL
  const renderFrame = useCallback(
    (p: number) => {
      const gl = glRef.current
      const prog = programRef.current
      if (!gl || !prog || !textureRef.current) return

      gl.useProgram(prog)

      const u = uniformsRef.current
      if (u.uProgress) gl.uniform1f(u.uProgress, p)
      if (u.uAngle) gl.uniform1f(u.uAngle, (angle * Math.PI) / 180)
      if (u.uEffect) gl.uniform1f(u.uEffect, effect)

      const rgb = parseHexColor(fillColor)
      if (u.uFillColor) gl.uniform3f(u.uFillColor, rgb[0], rgb[1], rgb[2])

      let [ew, eh] = elementSizeRef.current
      if ((ew === 0 || eh === 0) && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2)
          ew = Math.round(rect.width * dpr)
          eh = Math.round(rect.height * dpr)
          elementSizeRef.current = [ew, eh]
          if (canvasRef.current) {
            canvasRef.current.width = ew
            canvasRef.current.height = eh
          }
          gl.viewport(0, 0, ew, eh)
        }
      }

      const safeEw = Math.max(ew, 1)
      const safeEh = Math.max(eh, 1)
      if (u.uElementSize) gl.uniform2f(u.uElementSize, safeEw, safeEh)

      const [tw, th] = textureSizeRef.current
      if (u.uTextureSize) gl.uniform2f(u.uTextureSize, Math.max(tw, 1), Math.max(th, 1))

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    },
    [angle, fillColor, effect]
  )

  // Start animated reveal
  const startReveal = useCallback(
    (startP = 0, customDur = duration, customDelay = delay) => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }

      // Refresh dimensions synchronously before animating
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2)
          const w = Math.round(rect.width * dpr)
          const h = Math.round(rect.height * dpr)
          elementSizeRef.current = [w, h]
          if (canvasRef.current) {
            canvasRef.current.width = w
            canvasRef.current.height = h
          }
          if (glRef.current) {
            glRef.current.viewport(0, 0, w, h)
          }
        }
      }

      const totalDurMs = customDur * 1000
      let startTime: number | null = null

      const run = (now: number) => {
        if (startTime === null) startTime = now
        const elapsed = now - startTime
        const t = Math.min(Math.max(elapsed / totalDurMs, 0), 1)

        // Smooth cubic-out easing
        const p = startP + (1 - startP) * (1 - Math.pow(1 - t, 2.6))
        progressRef.current = p
        renderFrame(p)

        if (t < 1) {
          rafIdRef.current = requestAnimationFrame(run)
        } else {
          progressRef.current = 1
          renderFrame(1)
          setIsRevealed(true)
          rafIdRef.current = null
        }
      }

      if (customDelay > 0) {
        const timer = setTimeout(() => {
          rafIdRef.current = requestAnimationFrame(run)
        }, customDelay * 1000)
        return () => clearTimeout(timer)
      } else {
        rafIdRef.current = requestAnimationFrame(run)
      }
    },
    [duration, delay, renderFrame]
  )

  // Initialize WebGL context and load image texture
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Try WebGL
    const gl =
      canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false }) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null)

    if (!gl) {
      setFallbackToImg(true)
      return
    }

    glRef.current = gl

    // Compile Shader helper
    const compileShader = (type: number, src: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, src)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("Shader compilation error:", gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = compileShader(gl.VERTEX_SHADER, VS_SOURCE)
    const fs = compileShader(gl.FRAGMENT_SHADER, FS_SOURCE)
    if (!vs || !fs) {
      setFallbackToImg(true)
      return
    }

    const program = gl.createProgram()
    if (!program) {
      setFallbackToImg(true)
      return
    }

    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("Program link error:", gl.getProgramInfoLog(program))
      setFallbackToImg(true)
      return
    }

    programRef.current = program
    gl.useProgram(program)

    // Fullscreen quad buffer
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )

    const aPos = gl.getAttribLocation(program, "aPosition")
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    // Uniform locations
    uniformsRef.current = {
      uTexture: gl.getUniformLocation(program, "uTexture"),
      uProgress: gl.getUniformLocation(program, "uProgress"),
      uAngle: gl.getUniformLocation(program, "uAngle"),
      uEffect: gl.getUniformLocation(program, "uEffect"),
      uFillColor: gl.getUniformLocation(program, "uFillColor"),
      uElementSize: gl.getUniformLocation(program, "uElementSize"),
      uTextureSize: gl.getUniformLocation(program, "uTextureSize"),
    }

    // Load Texture
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = src

    img.onload = () => {
      if (!glRef.current) return
      const texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        textureRef.current = texture
        textureSizeRef.current = [img.naturalWidth || img.width, img.naturalHeight || img.height]
        setIsLoaded(true)
        // Initial silent frame render to set uniforms and buffer state
        renderFrame(progressRef.current)
      } catch (err) {
        console.warn("WebGL texImage2D failed, falling back to native img:", err)
        setFallbackToImg(true)
      }
    }

    img.onerror = () => {
      setFallbackToImg(true)
    }

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      if (textureRef.current && gl) gl.deleteTexture(textureRef.current)
      if (buffer && gl) gl.deleteBuffer(buffer)
      if (program && gl) gl.deleteProgram(program)
      glRef.current = null
    }
  }, [src, renderFrame])

  // Update canvas dimensions on container resize
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas || fallbackToImg) return

    const updateSize = () => {
      const rect = container.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(rect.width * dpr)
      const h = Math.round(rect.height * dpr)

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        elementSizeRef.current = [w, h]

        const gl = glRef.current
        if (gl) {
          gl.viewport(0, 0, w, h)
          if (isLoaded) {
            renderFrame(progressRef.current)
          }
        }
      }
    }

    updateSize()
    const ro = new ResizeObserver(updateSize)
    ro.observe(container)
    return () => ro.disconnect()
  }, [isLoaded, renderFrame, fallbackToImg])

  // Trigger reveal on scroll as soon as image enters visible viewport area
  useEffect(() => {
    if (!isLoaded || fallbackToImg) return
    const container = containerRef.current
    if (!container) return

    let triggered = false
    const triggerEffect = () => {
      if (triggered || hasAnimatedRef.current) return
      triggered = true
      hasAnimatedRef.current = true
      startReveal(0, duration, delay)
    }

    // 1. Immediate viewport check (e.g., above fold or already in view)
    if (typeof window !== "undefined" && ScrollTrigger.isInViewport(container, 0.15)) {
      triggerEffect()
      return
    }

    // 2. GSAP ScrollTrigger (synced with Lenis smooth scroll)
    const st = ScrollTrigger.create({
      trigger: container,
      start: "top 88%",
      once: true,
      onEnter: triggerEffect,
    })

    // 3. Native IntersectionObserver fallback (bullet-proof across all browsers & scroll modes)
    let io: IntersectionObserver | null = null
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            triggerEffect()
            io?.disconnect()
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
      )
      io.observe(container)
    }

    return () => {
      st.kill()
      io?.disconnect()
    }
  }, [isLoaded, fallbackToImg, startReveal, duration, delay])

  // Handle interactive hover replay
  const handleMouseEnter = useCallback(() => {
    if (!hoverReplay || !isRevealed || fallbackToImg) return
    // Smooth high-speed re-crystallize from fine pixels
    startReveal(0.2, 0.85, 0)
  }, [hoverReplay, isRevealed, fallbackToImg, startReveal])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden group/emerge select-none", containerClassName)}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
    >
      {/* High-Performance WebGL Canvas */}
      {!fallbackToImg && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={cn(
            "absolute inset-0 h-full w-full pointer-events-none transition-opacity duration-300",
            className
          )}
          style={{ opacity: isLoaded ? 1 : 0 }}
        />
      )}

      {/* Accessible native image (hidden from view once WebGL is active, visible as fallback) */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className={cn(
          "h-full w-full object-cover transition-all duration-500",
          fallbackToImg
            ? "opacity-100"
            : isRevealed
            ? "opacity-0 group-hover/emerge:opacity-0"
            : "opacity-0",
          className
        )}
      />
    </div>
  )
}

export default EmergingImage
