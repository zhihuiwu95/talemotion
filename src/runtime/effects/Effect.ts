export interface EffectParameters {
  density?: number
}

export interface SceneEffect {
  readonly name: string
  start(parameters?: EffectParameters): void
  stop(): void
  pause(): void
  resume(): void
  reset(): void
  dispose(): void
}
