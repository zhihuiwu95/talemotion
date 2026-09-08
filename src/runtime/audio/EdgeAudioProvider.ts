import manifest from '../../generated/narration.json'
import type { SpeechProvider, SpeechRequest } from './SpeechProvider'

/** Plays published Edge TTS recordings on one reusable media element. */
export class EdgeAudioProvider implements SpeechProvider {
  readonly available = typeof Audio !== 'undefined'
  private audio: HTMLAudioElement | null = null
  private generation = 0
  constructor(private readonly onStatus?: (failed: boolean) => void) {}

  private element(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio()
      this.audio.preload = 'auto'
      this.audio.hidden = true
      this.audio.setAttribute('aria-hidden', 'true')
      document.body.append(this.audio)
      this.audio.setAttribute('playsinline', '')
    }
    return this.audio
  }
  speak({ text }: SpeechRequest): void {
    this.cancel()
    const source = (manifest.clips as Record<string, string>)[text]
    if (!this.available || !source) {
      this.onStatus?.(true)
      return
    }
    const audio = this.element()
    const generation = this.generation
    audio.onerror = () => {
      if (generation === this.generation) this.onStatus?.(true)
    }
    audio.src = `${import.meta.env.BASE_URL}${source}`
    // Call play synchronously in the click handler; don't await fetch before this.
    void audio
      .play()
      .then(() => {
        if (generation === this.generation) this.onStatus?.(false)
      })
      .catch(() => {
        if (generation === this.generation) this.onStatus?.(true)
      })
  }
  pause(): void {
    this.audio?.pause()
  }
  resume(): void {
    if (!this.audio?.getAttribute('src')) return
    const generation = this.generation
    void this.audio
      .play()
      .then(() => {
        if (generation === this.generation) this.onStatus?.(false)
      })
      .catch(() => {
        if (generation === this.generation) this.onStatus?.(true)
      })
  }
  cancel(): void {
    this.generation++
    if (this.audio) {
      this.audio.onerror = null
      this.audio.pause()
      this.audio.removeAttribute('src')
      this.audio.load()
    }
  }
  dispose(): void {
    this.cancel()
    this.audio?.remove()
    this.audio = null
  }
}
