"use client"

import React, {
  useRef, useEffect, useState, createElement,
  useMemo, useCallback, memo,
} from "react"
import { useTheme } from "next-themes"

// ─── Tag enum ────────────────────────────────────────────────────────────────
export enum Tag {
  H1 = "h1", H2 = "h2", H3 = "h3", P = "p",
}

// ─── Types ───────────────────────────────────────────────────────────────────
type Particle = {
  x: number; y: number; originalX: number; originalY: number
  color: string; opacity: number; originalAlpha: number
  velocityX: number; velocityY: number
  angle: number; speed: number
  shouldFadeQuickly?: boolean
}
type TextBoundaries = { left: number; right: number; width: number }

declare global {
  interface HTMLCanvasElement { textBoundaries?: TextBoundaries }
}

type VaporizeTextCycleProps = {
  texts: string[]
  font?: { fontFamily?: string; fontSize?: string; fontWeight?: number }
  color?: string
  spread?: number
  density?: number
  animation?: {
    vaporizeDuration?: number
    fadeInDuration?: number
    waitDuration?: number
  }
  direction?: "left-to-right" | "right-to-left"
  alignment?: "left" | "center" | "right"
  tag?: Tag
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function transformValue(input: number, inputRange: number[], outputRange: number[], clamp = false): number {
  const progress = (input - inputRange[0]) / (inputRange[1] - inputRange[0])
  let result = outputRange[0] + progress * (outputRange[1] - outputRange[0])
  if (clamp) {
    if (outputRange[1] > outputRange[0]) result = Math.min(Math.max(result, outputRange[0]), outputRange[1])
    else result = Math.min(Math.max(result, outputRange[1]), outputRange[0])
  }
  return result
}

function calculateVaporizeSpread(fontSize: number): number {
  const points = [{ size: 10, spread: 0.08 }, { size: 20, spread: 0.15 }, { size: 50, spread: 0.5 }, { size: 100, spread: 1.5 }]
  if (fontSize <= points[0].size) return points[0].spread
  if (fontSize >= points[points.length - 1].size) return points[points.length - 1].spread
  let i = 0
  while (i < points.length - 1 && points[i + 1].size < fontSize) i++
  const p1 = points[i], p2 = points[i + 1]
  return p1.spread + (fontSize - p1.size) * (p2.spread - p1.spread) / (p2.size - p1.size)
}

function parseColor(color: string): string {
  const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
  if (rgbaMatch) return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${rgbaMatch[4]})`
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (rgbMatch) return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, 1)`
  return "rgba(0, 0, 0, 1)"
}

function useIsInView(ref: React.RefObject<HTMLElement>) {
  const [isInView, setIsInView] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => setIsInView(e.isIntersecting), { threshold: 0, rootMargin: "50px" })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [ref])
  return isInView
}

// ─── Particle system ─────────────────────────────────────────────────────────
function createParticles(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  text: string,
  textX: number, textY: number,
  font: string, color: string,
  alignment: "left" | "center" | "right",
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = color
  ctx.font = font
  ctx.textAlign = alignment
  ctx.textBaseline = "middle"
  ctx.imageSmoothingQuality = "high"
  ctx.imageSmoothingEnabled = true
  ;(ctx as any).fontKerning = "normal"
  ;(ctx as any).textRendering = "geometricPrecision"

  const metrics = ctx.measureText(text)
  const textWidth = metrics.width
  let textLeft = alignment === "center" ? textX - textWidth / 2 : alignment === "right" ? textX - textWidth : textX
  const textBoundaries: TextBoundaries = { left: textLeft, right: textLeft + textWidth, width: textWidth }

  ctx.fillText(text, textX, textY)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  const currentDPR = canvas.width / parseInt(canvas.style.width || "1")
  const baseSampleRate = Math.max(1, Math.round(currentDPR / 3))
  const particles: Particle[] = []

  for (let y = 0; y < canvas.height; y += baseSampleRate) {
    for (let x = 0; x < canvas.width; x += baseSampleRate) {
      const idx = (y * canvas.width + x) * 4
      if (data[idx + 3] > 0) {
        const originalAlpha = data[idx + 3] / 255 * (baseSampleRate / currentDPR)
        particles.push({
          x, y, originalX: x, originalY: y,
          color: `rgba(${data[idx]}, ${data[idx + 1]}, ${data[idx + 2]}, ${originalAlpha})`,
          opacity: originalAlpha, originalAlpha,
          velocityX: 0, velocityY: 0, angle: 0, speed: 0,
        })
      }
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  return { particles, textBoundaries }
}

function updateParticles(
  particles: Particle[], vaporizeX: number, deltaTime: number,
  SPREAD: number, VAPORIZE_DURATION: number,
  direction: string, density: number,
): boolean {
  let allVaporized = true
  particles.forEach(p => {
    const shouldVaporize = direction === "left-to-right" ? p.originalX <= vaporizeX : p.originalX >= vaporizeX
    if (shouldVaporize) {
      if (p.speed === 0) {
        p.angle = Math.random() * Math.PI * 2
        p.speed = (Math.random() * 1 + 0.5) * SPREAD
        p.velocityX = Math.cos(p.angle) * p.speed
        p.velocityY = Math.sin(p.angle) * p.speed
        p.shouldFadeQuickly = Math.random() > density
      }
      if (p.shouldFadeQuickly) {
        p.opacity = Math.max(0, p.opacity - deltaTime)
      } else {
        const dx = p.originalX - p.x, dy = p.originalY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const damp = Math.max(0.95, 1 - dist / (100 * SPREAD))
        const rSpread = SPREAD * 3
        p.velocityX = (p.velocityX + (Math.random() - 0.5) * rSpread + dx * 0.002) * damp
        p.velocityY = (p.velocityY + (Math.random() - 0.5) * rSpread + dy * 0.002) * damp
        const maxV = SPREAD * 2
        const curV = Math.sqrt(p.velocityX ** 2 + p.velocityY ** 2)
        if (curV > maxV) { p.velocityX *= maxV / curV; p.velocityY *= maxV / curV }
        p.x += p.velocityX * deltaTime * 20
        p.y += p.velocityY * deltaTime * 10
        p.opacity = Math.max(0, p.opacity - deltaTime * 0.25 * (2000 / VAPORIZE_DURATION))
      }
      if (p.opacity > 0.01) allVaporized = false
    } else {
      allVaporized = false
    }
  })
  return allVaporized
}

function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[], dpr: number) {
  ctx.save()
  ctx.scale(dpr, dpr)
  particles.forEach(p => {
    if (p.opacity > 0) {
      ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.opacity})`)
      ctx.fillRect(p.x / dpr, p.y / dpr, 1, 1)
    }
  })
  ctx.restore()
}

function resetParticles(particles: Particle[]) {
  particles.forEach(p => {
    p.x = p.originalX; p.y = p.originalY; p.opacity = p.originalAlpha
    p.speed = 0; p.velocityX = 0; p.velocityY = 0
  })
}

// ─── SEO element ─────────────────────────────────────────────────────────────
const SeoElement = memo(({ tag = Tag.P, texts }: { tag: Tag; texts: string[] }) => {
  const style = useMemo(() => ({
    position: "absolute" as const, width: "0", height: "0",
    overflow: "hidden", userSelect: "none" as const, pointerEvents: "none" as const,
  }), [])
  const safeTag = Object.values(Tag).includes(tag) ? tag : "p"
  return createElement(safeTag, { style }, texts?.join(" ") ?? "")
})
SeoElement.displayName = "SeoElement"

// ─── Main component ───────────────────────────────────────────────────────────
export default function VaporizeTextCycle({
  texts = ["IntelliConnect"],
  font = { fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600 },
  color,
  spread = 3,
  density = 5,
  animation = { vaporizeDuration: 2.5, fadeInDuration: 0.8, waitDuration: 1.5 },
  direction = "left-to-right",
  alignment = "left",
  tag = Tag.P,
}: VaporizeTextCycleProps) {
  const { resolvedTheme } = useTheme()
  // Adaptive color: primary blue in light, white in dark
  const resolvedColor = color ?? (resolvedTheme === "dark" ? "rgb(255, 255, 255)" : "rgb(0, 112, 173)")

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const isInView = useIsInView(wrapperRef as React.RefObject<HTMLElement>)
  const lastFontRef = useRef<string | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number | null>(null)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [animationState, setAnimationState] = useState<"static" | "vaporizing" | "fadingIn" | "waiting">("static")
  const vaporizeProgressRef = useRef(0)
  const fadeOpacityRef = useRef(0)
  const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 })
  const transformedDensity = transformValue(density, [0, 10], [0.3, 1], true)

  const globalDpr = useMemo(() => (typeof window !== "undefined" ? window.devicePixelRatio * 1.5 || 1 : 1), [])

  const durations = useMemo(() => ({
    VAPORIZE: (animation.vaporizeDuration ?? 2.5) * 1000,
    FADE_IN: (animation.fadeInDuration ?? 0.8) * 1000,
    WAIT: (animation.waitDuration ?? 1.5) * 1000,
  }), [animation.vaporizeDuration, animation.fadeInDuration, animation.waitDuration])

  const fontConfig = useMemo(() => {
    const fontSize = parseInt(font.fontSize?.replace("px", "") || "14")
    const SPREAD = calculateVaporizeSpread(fontSize) * spread
    return {
      fontSize,
      SPREAD,
      font: `${font.fontWeight ?? 600} ${fontSize * globalDpr}px ${font.fontFamily}`,
    }
  }, [font.fontSize, font.fontWeight, font.fontFamily, spread, globalDpr])

  const doRender = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !wrapperSize.width || !wrapperSize.height) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const { width, height } = wrapperSize
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvas.width = Math.floor(width * globalDpr)
    canvas.height = Math.floor(height * globalDpr)
    const textX = alignment === "center" ? canvas.width / 2 : alignment === "right" ? canvas.width : 0
    const textY = canvas.height / 2
    const { particles, textBoundaries } = createParticles(
      ctx, canvas, texts[currentTextIndex] || "", textX, textY,
      fontConfig.font, parseColor(resolvedColor), alignment,
    )
    particlesRef.current = particles
    canvas.textBoundaries = textBoundaries
  }, [wrapperSize, globalDpr, texts, currentTextIndex, fontConfig.font, resolvedColor, alignment])

  // Re-render when text, color or size changes
  useEffect(() => { doRender() }, [doRender])

  // Handle font change (re-render after 1s)
  useEffect(() => {
    const currentFont = font.fontFamily || "sans-serif"
    if (currentFont !== lastFontRef.current) {
      lastFontRef.current = currentFont
      const id = setTimeout(doRender, 1000)
      return () => clearTimeout(id)
    }
  }, [font.fontFamily, doRender])

  // Resize observer
  useEffect(() => {
    const container = wrapperRef.current
    if (!container) return
    const obs = new ResizeObserver(entries => {
      for (const e of entries) {
        setWrapperSize({ width: e.contentRect.width, height: e.contentRect.height })
      }
    })
    obs.observe(container)
    return () => obs.disconnect()
  }, [])

  // Initial size
  useEffect(() => {
    if (wrapperRef.current) {
      const r = wrapperRef.current.getBoundingClientRect()
      setWrapperSize({ width: r.width, height: r.height })
    }
  }, [])

  // Start animation when in view
  useEffect(() => {
    if (isInView) {
      const id = setTimeout(() => setAnimationState("vaporizing"), 0)
      return () => clearTimeout(id)
    } else {
      setAnimationState("static")
      if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null }
    }
  }, [isInView])

  // Animation loop
  useEffect(() => {
    if (!isInView) return
    let lastTime = performance.now()
    let frameId: number

    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000
      lastTime = now
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!canvas || !ctx || !particlesRef.current.length) {
        frameId = requestAnimationFrame(animate)
        return
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      switch (animationState) {
        case "static":
        case "waiting":
          renderParticles(ctx, particlesRef.current, globalDpr)
          break

        case "vaporizing": {
          vaporizeProgressRef.current += dt * 100 / (durations.VAPORIZE / 1000)
          const bounds = canvas.textBoundaries
          if (!bounds) break
          const progress = Math.min(100, vaporizeProgressRef.current)
          const vaporizeX = direction === "left-to-right"
            ? bounds.left + bounds.width * progress / 100
            : bounds.right - bounds.width * progress / 100
          const done = updateParticles(particlesRef.current, vaporizeX, dt, fontConfig.SPREAD, durations.VAPORIZE, direction, transformedDensity)
          renderParticles(ctx, particlesRef.current, globalDpr)
          if (vaporizeProgressRef.current >= 100 && done) {
            setCurrentTextIndex(prev => (prev + 1) % texts.length)
            setAnimationState("fadingIn")
            fadeOpacityRef.current = 0
          }
          break
        }

        case "fadingIn": {
          fadeOpacityRef.current += dt * 1000 / durations.FADE_IN
          ctx.save()
          ctx.scale(globalDpr, globalDpr)
          particlesRef.current.forEach(p => {
            p.x = p.originalX; p.y = p.originalY
            const opacity = Math.min(fadeOpacityRef.current, 1) * p.originalAlpha
            ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${opacity})`)
            ctx.fillRect(p.x / globalDpr, p.y / globalDpr, 1, 1)
          })
          ctx.restore()
          if (fadeOpacityRef.current >= 1) {
            setAnimationState("waiting")
            setTimeout(() => {
              setAnimationState("vaporizing")
              vaporizeProgressRef.current = 0
              resetParticles(particlesRef.current)
            }, durations.WAIT)
          }
          break
        }
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [animationState, isInView, texts.length, direction, globalDpr, durations, fontConfig.SPREAD, transformedDensity])

  return (
    <div ref={wrapperRef} style={{ width: "100%", height: "100%", pointerEvents: "none" }}>
      <canvas ref={canvasRef} style={{ minWidth: "30px", minHeight: "10px", pointerEvents: "none" }} />
      <SeoElement tag={tag} texts={texts} />
    </div>
  )
}
