import type { TimelineAction } from '../../schema/scene'
import type { SpeechProvider } from './SpeechProvider'

type AudioPlayAction = Extract<TimelineAction, { type: 'audio.play' }>

export type RuntimeWarningHandler = (message: string) => void

export class AudioManager {
  private readonly activeAudio = new Set<HTMLAudioElement>()

  constructor(
    private readonly speech: SpeechProvider,
    private readonly assets: Record<string, string>,
    private readonly warn: RuntimeWarningHandler = console.warn,
  ) {}

  play(action: AudioPlayAction): void {
    if (action.text) {
      if (!this.speech.available) {
        this.warn('当前浏览器无法播放旁白，动画将继续静音播放。')
      }
      this.speech.speak({
        text: action.text,
        voice: action.voice,
        lang: action.lang,
        rate: action.rate,
        pitch: action.pitch,
      })
    }

    if (!action.asset) return
    const source = this.assets[action.asset]
    if (!source || typeof Audio === 'undefined') {
      this.warn(`音频素材“${action.asset}”不可用，动画将继续播放。`)
      return
    }

    const audio = new Audio(source)
    audio.loop = action.channel === 'bgm'
    audio.volume = action.channel === 'bgm' ? 0.3 : 0.8
    this.activeAudio.add(audio)
    audio.addEventListener('ended', () => this.activeAudio.delete(audio), { once: true })
    audio.addEventListener(
      'error',
      () => {
        this.activeAudio.delete(audio)
        this.warn(`音频素材“${action.asset}”加载失败，动画将继续播放。`)
      },
      { once: true },
    )
    void audio.play().catch(() => {
      this.activeAudio.delete(audio)
      this.warn(`音频素材“${action.asset}”无法播放，动画将继续播放。`)
    })
  }

  pause(): void {
    this.speech.pause()
    this.activeAudio.forEach((audio) => audio.pause())
  }

  resume(): void {
    this.speech.resume()
    this.activeAudio.forEach((audio) => void audio.play().catch(() => undefined))
  }

  reset(): void {
    this.speech.cancel()
    this.activeAudio.forEach((audio) => {
      audio.pause()
      audio.currentTime = 0
    })
    this.activeAudio.clear()
  }

  dispose(): void {
    this.reset()
    this.speech.dispose()
  }
}
