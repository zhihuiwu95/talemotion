import type { EffectParameters, SceneEffect } from './Effect'

export class UnknownEffectError extends Error {
  constructor(effectName: string) {
    super(`No effect registered for "${effectName}"`)
    this.name = 'UnknownEffectError'
  }
}

export class EffectManager {
  private readonly effects = new Map<string, SceneEffect>()

  register(effect: SceneEffect): this {
    this.effects.set(effect.name, effect)
    return this
  }

  start(name: string, parameters?: EffectParameters): void {
    this.get(name).start(parameters)
  }

  stop(name: string): void {
    this.get(name).stop()
  }

  pause(): void {
    this.effects.forEach((effect) => effect.pause())
  }

  resume(): void {
    this.effects.forEach((effect) => effect.resume())
  }

  reset(): void {
    this.effects.forEach((effect) => effect.reset())
  }

  dispose(): void {
    this.effects.forEach((effect) => effect.dispose())
    this.effects.clear()
  }

  private get(name: string): SceneEffect {
    const effect = this.effects.get(name)
    if (!effect) {
      throw new UnknownEffectError(name)
    }
    return effect
  }
}
