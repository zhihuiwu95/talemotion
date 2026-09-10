import manifest from '../../generated/narration.json'
import type { SpeechProvider, SpeechRequest } from './SpeechProvider'

/** Plays published narration on one reusable media element (legacy class name). */
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
  speak({ text, onComplete }: SpeechRequest): void {
    this.cancel()
    const source = (manifest.clips as Record<string, string>)[text]
    if (!this.available || !source) {
      this.onStatus?.(true)
      onComplete?.()
      return
    }
    const audio = this.element()
    const generation = this.generation
    let settled = false
    const complete = () => {
      if (generation !== this.generation || settled) return
      settled = true
      onComplete?.()
    }
    audio.onended = complete
    audio.onerror = () => {
      if (generation === this.generation) {
        this.onStatus?.(true)
        complete()
      }
    }
    audio.src = `${import.meta.env.BASE_URL}${source}`
    // Call play synchronously in the click handler; don't await fetch before this.
    void audio
      .play()
      .then(() => {
        if (generation === this.generation) this.onStatus?.(false)
      })
      .catch(() => {
        if (generation === this.generation) {
          this.onStatus?.(true)
          complete()
        }
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
      this.audio.onended = null
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
