import { describe, expect, it, vi } from 'vitest'
import { AudioManager } from './AudioManager'
import type { SpeechProvider } from './SpeechProvider'

function silentProvider(): SpeechProvider {
  return {
    available: false,
    speak: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    cancel: vi.fn(),
    dispose: vi.fn(),
  }
}

describe('AudioManager', () => {
  it('degrades to silent playback when browser narration is unavailable', () => {
    const speech = silentProvider()
    const warn = vi.fn()
    const audio = new AudioManager(speech, {}, warn)

    audio.play({
      at: 0,
      type: 'audio.play',
      channel: 'narration',
      text: '从前有一片森林',
      lang: 'zh-CN',
    })

    expect(warn).toHaveBeenCalledWith(
      '当前浏览器无法播放旁白，动画将继续静音播放。',
    )
    expect(speech.speak).toHaveBeenCalledWith({
      id: 'missing:legacy',
      text: '从前有一片森林',
      voice: undefined,
      lang: 'zh-CN',
      rate: undefined,
      pitch: undefined,
    })
  })
})
