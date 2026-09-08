import { Application, Assets, Container, Sprite, type Texture } from 'pixi.js'
import type { SceneDefinition, SceneObjectDefinition } from '../schema/scene'
import { createDefaultActionRegistry } from './createDefaultActionRegistry'
import { AudioManager } from './audio/AudioManager'
import { EdgeAudioProvider } from './audio/EdgeAudioProvider'
import { EffectManager } from './effects/EffectManager'
import { SnowEffect } from './effects/SnowEffect'
import { PlaybackController, type PlaybackState } from './PlaybackController'
import type { RuntimeContext } from './RuntimeContext'
import { TimelineEngine } from './TimelineEngine'

export interface SceneRuntimeEvents {
  onTime?: (time: number) => void
  onStateChange?: (state: PlaybackState) => void
  onWarning?: (message: string) => void
}

export class SceneRuntime {
  private readonly application = new Application()
  private readonly camera = new Container()
  private readonly effectLayer = new Container()
  private readonly objects = new Map<string, Sprite>()
  private readonly textures = new Map<string, Texture>()
  private readonly effects = new EffectManager()
  private readonly audio: AudioManager
  private controller?: PlaybackController
  private initialized = false

  constructor(
    readonly scene: SceneDefinition,
    private readonly events: SceneRuntimeEvents = {},
  ) {
    this.audio = new AudioManager(
      new EdgeAudioProvider((failed) => { if (failed) events.onWarning?.('旁白加载或播放失败，可暂停后继续重试。') }),
      scene.assets,
      (message) => events.onWarning?.(message),
    )
  }

  async mount(host: HTMLElement): Promise<void> {
    if (this.initialized) throw new Error('SceneRuntime can only be mounted once')

    await this.application.init({
      width: this.scene.viewport.width,
      height: this.scene.viewport.height,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      backgroundAlpha: 0,
    })

    this.application.canvas.className = 'scene-canvas'
    this.application.canvas.style.width = '100%'
    this.application.canvas.style.height = '100%'
    this.application.canvas.setAttribute('aria-label', `${this.scene.title}动画场景`)
    host.replaceChildren(this.application.canvas)

    await this.loadAssets()
    this.buildStage()
    this.application.render()

    const context: RuntimeContext = {
      scene: this.scene,
      camera: this.camera,
      objects: this.objects,
      textures: this.textures,
      effects: this.effects,
      audio: this.audio,
      setExpression: (target, expression) => this.setExpression(target, expression),
    }
    const timeline = new TimelineEngine(
      this.scene,
      createDefaultActionRegistry(),
      context,
    )
    timeline.onUpdate((time) => this.events.onTime?.(time))

    this.controller = new PlaybackController(
      timeline,
      {
        pause: () => {
          this.effects.pause()
          this.audio.pause()
        },
        resume: () => {
          this.effects.resume()
          this.audio.resume()
        },
        reset: () => this.resetSceneState(),
        dispose: () => {
          this.effects.dispose()
          this.audio.dispose()
        },
      },
      (state) => this.events.onStateChange?.(state),
    )
    this.initialized = true
    this.events.onTime?.(0)
    this.events.onStateChange?.('ready')
  }

  play(): void {
    this.requireController().play()
  }

  pause(): void {
    this.requireController().pause()
  }

  restart(): void {
    this.requireController().restart()
  }

  dispose(): void {
    if (!this.initialized) return
    this.controller?.dispose()
    this.objects.clear()
    this.textures.clear()
    this.application.destroy(true, {
      children: true,
      texture: false,
      textureSource: false,
    })
    this.initialized = false
  }

  private async loadAssets(): Promise<void> {
    await Promise.all(
      Object.entries(this.scene.assets).map(async ([id, source]) => {
        if (isAudioSource(source)) return
        const texture = await Assets.load<Texture>(source)
        this.textures.set(id, texture)
      }),
    )
  }

  private buildStage(): void {
    const { width, height } = this.scene.viewport
    this.camera.label = 'scene-camera'
    this.camera.sortableChildren = false
    this.camera.position.set(width / 2, height / 2)
    this.camera.pivot.set(width / 2, height / 2)

    const orderedObjects = [...this.scene.objects].sort(
      (left, right) => (left.zIndex ?? 0) - (right.zIndex ?? 0),
    )
    orderedObjects.forEach((definition) => {
      const texture = this.textures.get(definition.asset)
      if (!texture) throw new Error(`Texture "${definition.asset}" was not loaded`)
      const sprite = new Sprite({ texture })
      sprite.label = definition.id
      this.applyObjectState(sprite, definition)
      this.camera.addChild(sprite)
      this.objects.set(definition.id, sprite)
    })

    this.effectLayer.label = 'scene-effects'
    this.effectLayer.zIndex = 1_000
    this.camera.addChild(this.effectLayer)
    this.application.stage.addChild(this.camera)
    this.effects.register(
      new SnowEffect(this.effectLayer, this.application.ticker, this.scene.viewport),
    )
  }

  private resetSceneState(): void {
    this.scene.objects.forEach((definition) => {
      const sprite = this.objects.get(definition.id)
      if (!sprite) return
      const texture = this.textures.get(definition.asset)
      if (texture) sprite.texture = texture
      this.applyObjectState(sprite, definition)
    })

    const { width, height } = this.scene.viewport
    this.camera.position.set(width / 2, height / 2)
    this.camera.pivot.set(width / 2, height / 2)
    this.camera.scale.set(1)
    this.effects.reset()
    this.audio.reset()
    this.events.onTime?.(0)
  }

  private applyObjectState(sprite: Sprite, definition: SceneObjectDefinition): void {
    sprite.position.set(definition.x, definition.y)
    sprite.anchor.set(definition.anchor[0], definition.anchor[1])
    sprite.rotation = ((definition.rotation ?? 0) * Math.PI) / 180
    sprite.alpha = definition.alpha ?? 1
    sprite.visible = definition.visible ?? true
    sprite.zIndex = definition.zIndex ?? 0
    sprite.scale.set(1)

    if (definition.width !== undefined) sprite.width = definition.width
    if (definition.height !== undefined) sprite.height = definition.height

    if (definition.scale !== undefined) {
      if (typeof definition.scale === 'number') {
        sprite.scale.set(definition.scale)
      } else {
        sprite.scale.set(definition.scale[0], definition.scale[1])
      }
    }
  }

  private setExpression(targetId: string, expression: string): void {
    const definition = this.scene.objects.find(({ id }) => id === targetId)
    const assetId = definition?.expressions?.[expression]
    const sprite = this.objects.get(targetId)
    const texture = assetId ? this.textures.get(assetId) : undefined
    if (!definition || !assetId || !sprite || !texture) {
      throw new Error(`Expression "${expression}" is unavailable for "${targetId}"`)
    }
    sprite.texture = texture
  }

  private requireController(): PlaybackController {
    if (!this.controller) throw new Error('SceneRuntime is not mounted')
    return this.controller
  }
}

function isAudioSource(source: string): boolean {
  return /\.(mp3|m4a|aac|ogg|wav)(?:\?|$)/i.test(source)
}
