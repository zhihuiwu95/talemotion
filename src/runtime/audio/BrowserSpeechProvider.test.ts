import { afterEach, describe, expect, it, vi } from 'vitest'
import { BrowserSpeechProvider } from './BrowserSpeechProvider'

class MockSpeechSynthesisUtterance {
  readonly text: string
  rate = 1
  pitch = 1
  lang = ''
  voice: SpeechSynthesisVoice | null = null
  onerror?: (event: { error: string }) => void

  constructor(text: string) {
    this.text = text
  }
}

describe('BrowserSpeechProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('requests Mandarin and selects an exact Chinese voice', () => {
    const englishVoice = { name: 'Samantha', lang: 'en-US' } as SpeechSynthesisVoice
    const chineseVoice = { name: 'Tingting', lang: 'zh-CN' } as SpeechSynthesisVoice
    const speak = vi.fn()

    vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance)
    vi.stubGlobal('speechSynthesis', {
      cancel: vi.fn(),
      getVoices: () => [englishVoice, chineseVoice],
      speak,
    })

    const provider = new BrowserSpeechProvider()
    provider.speak({
      text: '冬夜里，皮普循着一缕微光。',
      lang: 'zh-CN',
      rate: 0.92,
      pitch: 1.04,
    })

    const utterance = speak.mock.calls[0]?.[0] as MockSpeechSynthesisUtterance
    expect(utterance.text).toBe('冬夜里，皮普循着一缕微光。')
    expect(utterance.lang).toBe('zh-CN')
    expect(utterance.voice).toBe(chineseVoice)
    expect(utterance.rate).toBe(0.92)
    expect(utterance.pitch).toBe(1.04)
  })

  it('reports unavailable speech but ignores cancellation when a child changes steps', () => {
    const speak = vi.fn()
    const onError = vi.fn()
    vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance)
    vi.stubGlobal('speechSynthesis', {
      cancel: vi.fn(), getVoices: () => [], speak,
    })
    new BrowserSpeechProvider(onError).speak({ text: '帮手套找朋友吧。' })
    const utterance = speak.mock.calls[0]?.[0] as MockSpeechSynthesisUtterance
    utterance.onerror?.({ error: 'canceled' })
    utterance.onerror?.({ error: 'interrupted' })
    expect(onError).not.toHaveBeenCalled()
    utterance.onerror?.({ error: 'synthesis-unavailable' })
    expect(onError).toHaveBeenCalledWith('synthesis-unavailable')
  })
})
