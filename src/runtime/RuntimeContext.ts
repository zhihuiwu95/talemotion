import type { Container, Sprite, Texture } from 'pixi.js'
import type { SceneDefinition } from '../schema/scene'
import type { AudioManager } from './audio/AudioManager'
import type { EffectManager } from './effects/EffectManager'

export interface RuntimeContext {
  readonly scene: SceneDefinition
  readonly camera: Container
  readonly objects: Map<string, Sprite>
  readonly textures: Map<string, Texture>
  readonly effects: EffectManager
  readonly audio: AudioManager
  setExpression(target: string, expression: string): void
}
