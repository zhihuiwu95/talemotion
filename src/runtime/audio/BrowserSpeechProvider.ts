import type { SpeechProvider, SpeechRequest } from './SpeechProvider'

export class BrowserSpeechProvider implements SpeechProvider {
  constructor(private readonly onError?: (error: string) => void) {}

  readonly available =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window

  speak(request: SpeechRequest): void {
    if (!this.available) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(request.text)
    utterance.rate = request.rate ?? 0.88
    utterance.pitch = request.pitch ?? 1.08
    utterance.lang = request.lang ?? 'zh-CN'

    const voices = window.speechSynthesis.getVoices()
    const requestedVoice = request.voice
      ? voices.find((voice) => voice.name === request.voice)
      : undefined
    const requestedLanguage = utterance.lang.toLowerCase()
    const baseLanguage = requestedLanguage.split('-')[0]
    utterance.voice =
      requestedVoice ??
      voices.find((voice) => voice.lang.toLowerCase() === requestedLanguage) ??
      voices.find((voice) =>
        voice.lang.toLowerCase().startsWith(`${baseLanguage}-`),
      ) ??
      null

    utterance.onerror = (event) => {
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        this.onError?.(event.error)
      }
    }
    window.speechSynthesis.speak(utterance)
  }

  pause(): void {
    if (this.available && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause()
    }
  }

  resume(): void {
    if (this.available && window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
  }

  cancel(): void {
    if (this.available) window.speechSynthesis.cancel()
  }

  dispose(): void {
    this.cancel()
  }
}
