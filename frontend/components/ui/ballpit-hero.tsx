"use client"

import React, { useRef, useEffect, useMemo } from "react"
import {
  Clock, PerspectiveCamera, Scene, WebGLRenderer, SRGBColorSpace, MathUtils,
  Vector2, Vector3, MeshPhysicalMaterial, Color, Object3D, InstancedMesh,
  PMREMGenerator, SphereGeometry, AmbientLight, PointLight, ACESFilmicToneMapping,
  Raycaster, Plane,
} from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import { useTheme } from "next-themes"
import { cn } from "@/frontend/lib/utils"

// ─── Capgemini colour palettes ───────────────────────────────────────────────
const LIGHT_COLORS = ["#0070AD", "#12ABDB", "#005F8E", "#00A3E0", "#003F7F", "#4DB8E8"]
const DARK_COLORS  = ["#003F7F", "#0070AD", "#005F8E", "#12ABDB", "#002555", "#00A3E0"]

// ─── Three.js scene wrapper ──────────────────────────────────────────────────
class ThreeScene {
  #resizeObserver?: ResizeObserver
  #intersectionObserver?: IntersectionObserver
  #resizeTimer?: number
  #animationFrameId = 0
  #clock = new Clock()
  #animationState = { elapsed: 0, delta: 0 }
  #isAnimating = false
  #isVisible = false

  canvas: HTMLCanvasElement
  camera: PerspectiveCamera
  scene: Scene
  renderer: WebGLRenderer
  size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0 }
  onBeforeRender: (s: { elapsed: number; delta: number }) => void = () => {}
  onAfterResize: (s: typeof this.size) => void = () => {}

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.camera = new PerspectiveCamera(50, 1, 0.1, 100)
    this.scene = new Scene()
    this.renderer = new WebGLRenderer({ canvas, powerPreference: "high-performance", alpha: true, antialias: true })
    this.renderer.outputColorSpace = SRGBColorSpace
    this.canvas.style.display = "block"
    this.#initObservers()
    this.resize()
  }

  #initObservers() {
    const parent = this.canvas.parentNode as Element | null
    if (parent) {
      this.#resizeObserver = new ResizeObserver(this.#onResize.bind(this))
      this.#resizeObserver.observe(parent)
    } else {
      window.addEventListener("resize", this.#onResize.bind(this))
    }
    this.#intersectionObserver = new IntersectionObserver(this.#onIntersection.bind(this), { threshold: 0 })
    this.#intersectionObserver.observe(this.canvas)
    document.addEventListener("visibilitychange", this.#onVisibilityChange.bind(this))
  }

  #onResize() {
    if (this.#resizeTimer) clearTimeout(this.#resizeTimer)
    this.#resizeTimer = window.setTimeout(this.resize.bind(this), 100)
  }

  resize() {
    const parent = this.canvas.parentNode as HTMLElement | null
    const w = parent ? parent.offsetWidth : window.innerWidth
    const h = parent ? parent.offsetHeight : window.innerHeight
    this.size.width = w; this.size.height = h; this.size.ratio = w / h
    this.camera.aspect = this.size.ratio; this.camera.updateProjectionMatrix()
    const fovRad = (this.camera.fov * Math.PI) / 180
    this.size.wHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.z
    this.size.wWidth = this.size.wHeight * this.camera.aspect
    this.renderer.setSize(w, h)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.onAfterResize(this.size)
  }

  #onIntersection(e: IntersectionObserverEntry[]) {
    this.#isAnimating = e[0].isIntersecting
    this.#isAnimating ? this.#startAnimation() : this.#stopAnimation()
  }

  #onVisibilityChange() {
    if (this.#isAnimating) document.hidden ? this.#stopAnimation() : this.#startAnimation()
  }

  #startAnimation() {
    if (this.#isVisible) return
    this.#isVisible = true
    this.#clock.start()
    const f = () => {
      this.#animationFrameId = requestAnimationFrame(f)
      this.#animationState.delta = this.#clock.getDelta()
      this.#animationState.elapsed += this.#animationState.delta
      this.onBeforeRender(this.#animationState)
      this.renderer.render(this.scene, this.camera)
    }
    f()
  }

  #stopAnimation() {
    if (this.#isVisible) {
      cancelAnimationFrame(this.#animationFrameId)
      this.#isVisible = false
      this.#clock.stop()
    }
  }

  dispose() {
    this.#stopAnimation()
    this.#resizeObserver?.disconnect()
    this.#intersectionObserver?.disconnect()
    document.removeEventListener("visibilitychange", this.#onVisibilityChange.bind(this))
    this.scene.clear()
    this.renderer.dispose()
  }
}

// ─── Physics engine ──────────────────────────────────────────────────────────
class Physics {
  config: { count: number; gravity: number; friction: number; wallBounce: number; maxVelocity: number; maxX: number; maxY: number; maxZ: number; minSize: number; maxSize: number; size0: number; controlSphere0: boolean }
  positionData: Float32Array
  velocityData: Float32Array
  sizeData: Float32Array
  center = new Vector3()

  constructor(config: Physics["config"]) {
    this.config = config
    this.positionData = new Float32Array(3 * config.count)
    this.velocityData = new Float32Array(3 * config.count)
    this.sizeData = new Float32Array(config.count)
    this.#initPositions()
    this.setSizes()
  }

  #initPositions() {
    const { count, maxX, maxY, maxZ } = this.config
    this.center.toArray(this.positionData, 0)
    for (let i = 1; i < count; i++) {
      const idx = 3 * i
      this.positionData[idx]     = MathUtils.randFloatSpread(2 * maxX)
      this.positionData[idx + 1] = MathUtils.randFloatSpread(2 * maxY)
      this.positionData[idx + 2] = MathUtils.randFloatSpread(2 * maxZ)
    }
  }

  setSizes() {
    const { count, minSize, maxSize, size0 } = this.config
    this.sizeData[0] = size0
    for (let i = 1; i < count; i++) this.sizeData[i] = MathUtils.randFloat(minSize, maxSize)
  }

  update(deltaInfo: { delta: number }) {
    const { config, center, positionData, sizeData, velocityData } = this
    const start = config.controlSphere0 ? 1 : 0
    if (config.controlSphere0) {
      new Vector3().fromArray(positionData, 0).lerp(center, 0.1).toArray(positionData, 0)
      new Vector3().toArray(velocityData, 0)
    }
    for (let i = start; i < config.count; i++) {
      const base = 3 * i
      const pos = new Vector3().fromArray(positionData, base)
      const vel = new Vector3().fromArray(velocityData, base)
      vel.y -= deltaInfo.delta * config.gravity * sizeData[i]
      vel.multiplyScalar(config.friction)
      vel.clampLength(0, config.maxVelocity)
      pos.add(vel)
      for (let j = i + 1; j < config.count; j++) {
        const ob = 3 * j
        const other = new Vector3().fromArray(positionData, ob)
        const diff = new Vector3().subVectors(other, pos)
        const dist = diff.length()
        const sumR = sizeData[i] + sizeData[j]
        if (dist < sumR) {
          const overlap = (sumR - dist) * 0.5
          diff.normalize()
          pos.addScaledVector(diff, -overlap)
          other.addScaledVector(diff, overlap)
          other.toArray(positionData, ob)
        }
      }
      if (Math.abs(pos.x) + sizeData[i] > config.maxX) { pos.x = Math.sign(pos.x) * (config.maxX - sizeData[i]); vel.x *= -config.wallBounce }
      if (pos.y - sizeData[i] < -config.maxY) { pos.y = -config.maxY + sizeData[i]; vel.y *= -config.wallBounce }
      if (Math.abs(pos.z) + sizeData[i] > config.maxZ) { pos.z = Math.sign(pos.z) * (config.maxZ - sizeData[i]); vel.z *= -config.wallBounce }
      pos.toArray(positionData, base)
      vel.toArray(velocityData, base)
    }
  }
}

// ─── Instanced spheres ───────────────────────────────────────────────────────
const dummy = new Object3D()

class Spheres extends InstancedMesh {
  physics: Physics
  pointLight: PointLight

  constructor(renderer: WebGLRenderer, params: {
    count: number; colors: string[]; minSize: number; maxSize: number; size0: number
    gravity: number; friction: number; wallBounce: number; maxVelocity: number
    maxX: number; maxY: number; maxZ: number; controlSphere0: boolean
    lightIntensity: number; ambientIntensity: number
  }) {
    const pmrem = new PMREMGenerator(renderer)
    const env = pmrem.fromScene(new RoomEnvironment(renderer)).texture
    pmrem.dispose()
    const mat = new MeshPhysicalMaterial({ envMap: env, metalness: 0.6, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.15 })
    super(new SphereGeometry(1, 20, 20), mat, params.count)
    this.physics = new Physics(params)
    const ambient = new AmbientLight(0xffffff, params.ambientIntensity)
    this.add(ambient)
    this.pointLight = new PointLight(0xffffff, params.lightIntensity, 100, 1)
    this.add(this.pointLight)
    const colorObjs = params.colors.map(c => new Color(c))
    for (let i = 0; i < this.count; i++) this.setColorAt(i, colorObjs[i % colorObjs.length])
    if (this.instanceColor) this.instanceColor.needsUpdate = true
  }

  update(deltaInfo: { delta: number }) {
    this.physics.update(deltaInfo)
    for (let i = 0; i < this.count; i++) {
      dummy.position.fromArray(this.physics.positionData, 3 * i)
      dummy.scale.setScalar(this.physics.sizeData[i])
      dummy.updateMatrix()
      this.setMatrixAt(i, dummy.matrix)
    }
    this.instanceMatrix.needsUpdate = true
    this.pointLight.position.fromArray(this.physics.positionData, 0)
  }
}

// ─── Pointer tracking ────────────────────────────────────────────────────────
const pointer = new Vector2()
function onPointerMove(e: PointerEvent) {
  pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
}

// ─── Component ───────────────────────────────────────────────────────────────
interface BallpitHeroProps {
  greeting: string
  name: string
  subtitle: string
  badge?: string
  className?: string
  count?: number
}

export function BallpitHero({ greeting, name, subtitle, badge, className, count = 120 }: BallpitHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()

  const colors = useMemo(
    () => resolvedTheme === "dark" ? DARK_COLORS : LIGHT_COLORS,
    [resolvedTheme]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const three = new ThreeScene(canvas)
    three.renderer.toneMapping = ACESFilmicToneMapping
    three.camera.position.set(0, 0, 16)

    const spheres = new Spheres(three.renderer, {
      count,
      colors,
      minSize: 0.2, maxSize: 0.65, size0: 0.8,
      gravity: 0.35, friction: 0.995, wallBounce: 0.2, maxVelocity: 0.08,
      maxX: 10, maxY: 6, maxZ: 6,
      controlSphere0: true,
      lightIntensity: 3, ambientIntensity: 1.2,
    })
    three.scene.add(spheres)

    const raycaster = new Raycaster()
    const plane = new Plane(new Vector3(0, 0, 1), 0)
    const intersectionPoint = new Vector3()

    window.addEventListener("pointermove", onPointerMove)

    three.onBeforeRender = (deltaInfo) => {
      raycaster.setFromCamera(pointer, three.camera)
      if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
        spheres.physics.center.copy(intersectionPoint)
      }
      spheres.update(deltaInfo)
    }

    three.onAfterResize = (size) => {
      spheres.physics.config.maxX = size.wWidth / 2
      spheres.physics.config.maxY = size.wHeight / 2
      spheres.physics.config.maxZ = size.wWidth / 4
    }

    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      three.dispose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors, count])

  return (
    <div className={cn("relative w-full overflow-hidden rounded-2xl", className)} style={{ height: 260 }}>
      {/* Three.js canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Overlay gradient so text stays readable */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-background/90 via-background/60 to-transparent dark:from-[#000e24]/90 dark:via-[#000e24]/60" />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-center px-8 gap-2">
        <p className="text-base font-bold text-primary tracking-[0.15em] uppercase">{greeting}</p>
        <h1
          className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight"
          style={{
            background: "linear-gradient(135deg, #0070AD 0%, #12ABDB 50%, #ffffff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {name}
        </h1>
        <p className="text-sm text-muted-foreground/90 max-w-md font-medium">{subtitle}</p>
        {badge && (
          <span className="mt-1 inline-flex w-fit items-center text-xs font-bold text-primary capitalize bg-primary/10 border border-primary/20 px-3 py-1 rounded-full tracking-wide">
            {badge}
          </span>
        )}
      </div>
    </div>
  )
}
