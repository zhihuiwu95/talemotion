export interface SpeechRequest {
  text: string
  voice?: string
  lang?: string
  rate?: number
  pitch?: number
  /** Called once on completion or playback failure; cancellation suppresses it. */
  onComplete?: () => void
}

export interface SpeechProvider {
  readonly available: boolean
  speak(request: SpeechRequest): void
  pause(): void
  resume(): void
  cancel(): void
  dispose(): void
}

export class SilentSpeechProvider implements SpeechProvider {
  readonly available = false

  speak(): void {}
  pause(): void {}
  resume(): void {}
  cancel(): void {}
  dispose(): void {}
}
