import { Container, Graphics, type Ticker } from 'pixi.js'
import type { EffectParameters, SceneEffect } from './Effect'

interface SnowParticle {
  view: Graphics
  speed: number
  sway: number
  phase: number
}

interface Viewport {
  width: number
  height: number
}

export class SnowEffect implements SceneEffect {
  readonly name = 'snow'
  private readonly container = new Container()
  private readonly particles: SnowParticle[] = []
  private active = false
  private paused = false

  constructor(
    layer: Container,
    private readonly ticker: Ticker,
    private readonly viewport: Viewport,
  ) {
    this.container.label = 'effect:snow'
    this.container.visible = false
    layer.addChild(this.container)
    ticker.add(this.tick)
  }

  start(parameters: EffectParameters = {}): void {
    const density = parameters.density ?? 0.55
    this.rebuild(Math.round(24 + density * 72))
    this.active = true
    this.paused = false
    this.container.visible = true
  }

  stop(): void {
    this.active = false
    this.container.visible = false
  }

  pause(): void {
    this.paused = true
  }

  resume(): void {
    this.paused = false
  }

  reset(): void {
    this.stop()
    this.paused = false
    this.clearParticles()
  }

  dispose(): void {
    this.ticker.remove(this.tick)
    this.clearParticles()
    this.container.removeFromParent()
    this.container.destroy()
  }

  private readonly tick = (ticker: Ticker): void => {
    if (!this.active || this.paused) return
    const seconds = ticker.deltaMS / 1000

    this.particles.forEach((particle) => {
      particle.view.y += particle.speed * seconds
      particle.phase += seconds * 1.7
      particle.view.x += Math.sin(particle.phase) * particle.sway * seconds

      if (particle.view.y > this.viewport.height + 16) {
        particle.view.y = -16
        particle.view.x = (particle.view.x + this.viewport.width * 0.37) % this.viewport.width
      }
    })
  }

  private rebuild(count: number): void {
    this.clearParticles()
    const random = seededRandom(0x71a1e)

    for (let index = 0; index < count; index += 1) {
      const radius = 1.8 + random() * 4.4
      const view = new Graphics()
        .circle(0, 0, radius)
        .fill({ color: 0xf4fbff, alpha: 0.48 + random() * 0.5 })
      view.x = random() * this.viewport.width
      view.y = random() * this.viewport.height
      view.alpha = 0.65 + random() * 0.35
      this.container.addChild(view)
      this.particles.push({
        view,
        speed: 28 + random() * 76,
        sway: 4 + random() * 15,
        phase: random() * Math.PI * 2,
      })
    }
  }

  private clearParticles(): void {
    this.particles.splice(0).forEach(({ view }) => view.destroy())
    this.container.removeChildren()
  }
}

function seededRandom(seed: number): () => number {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 0x1_0000_0000
  }
}

