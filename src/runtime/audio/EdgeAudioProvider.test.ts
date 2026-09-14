import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import playback from '../../generated/narration-playback.json'
import index from '../../generated/narration-index.json'
import { EdgeAudioProvider } from './EdgeAudioProvider'

const text = Object.keys(index.legacy)[0]!
const id = (index.legacy as Record<string, string>)[text]!
let play: ReturnType<typeof vi.spyOn>
beforeEach(() => {
  play = vi
    .spyOn(HTMLMediaElement.prototype, 'play')
    .mockResolvedValue(undefined)
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
})
afterEach(() => {
  document.querySelectorAll('audio').forEach((audio) => audio.remove())
  vi.restoreAllMocks()
})
describe('Edge audio playback', () => {
  it('uses the explicit clip ID, never another character recording with matching text', () => {
    const status = vi.fn()
    const speech = new EdgeAudioProvider(status)
    speech.speak({ id, text: 'text is not used to choose audio' })
    expect(document.querySelector('audio')!.getAttribute('src')).toBe(`/${(playback as Record<string, string>)[id]}`)
    speech.speak({ id: 'unknown:clip', text })
    expect(status).toHaveBeenLastCalledWith(true)
    expect(play).toHaveBeenCalledOnce()
    speech.dispose()
  })

  it('signals completion once, ignores cancelled clips, and releases missing/failed audio', async () => {
    const done = vi.fn()
    const speech = new EdgeAudioProvider()
    speech.speak({ id, text, onComplete: done })
    const element = document.querySelector('audio')!
    const stale = element.onended as () => void
    speech.cancel()
    stale()
    expect(done).not.toHaveBeenCalled()
    speech.speak({ id, text, onComplete: done })
    element.dispatchEvent(new Event('ended'))
    element.dispatchEvent(new Event('ended'))
    expect(done).toHaveBeenCalledOnce()
    speech.speak({ text: 'missing', onComplete: done })
    expect(done).toHaveBeenCalledTimes(2)
    play.mockRejectedValueOnce(new Error('denied'))
    speech.speak({ id, text, onComplete: done })
    await Promise.resolve()
    await Promise.resolve()
    expect(done).toHaveBeenCalledTimes(3)
    speech.dispose()
  })
  it('starts immediately on the caller gesture, reuses the element and disposes it', async () => {
    const status = vi.fn()
    const speech = new EdgeAudioProvider(status)
    speech.speak({ id, text })
    expect(play).toHaveBeenCalledOnce()
    const element = document.querySelector('audio')!
    expect(element.src).toContain('/audio/')
    await Promise.resolve()
    expect(status).toHaveBeenLastCalledWith(false)
    speech.speak({ id, text })
    expect(document.querySelectorAll('audio')).toHaveLength(1)
    speech.pause()
    speech.resume()
    expect(play).toHaveBeenCalledTimes(3)
    speech.cancel()
    expect(element.getAttribute('src')).toBeNull()
    speech.dispose()
    expect(document.querySelector('audio')).toBeNull()
  })
  it('ignores stale aborted play promises but exposes current failures and recovers', async () => {
    let rejectOld!: (error: Error) => void
    play.mockImplementationOnce(
      () =>
        new Promise<void>((_, reject) => {
          rejectOld = reject
        }),
    )
    const status = vi.fn()
    const speech = new EdgeAudioProvider(status)
    speech.speak({ id, text })
    speech.speak({ id, text })
    rejectOld(new Error('old request aborted'))
    await Promise.resolve()
    await Promise.resolve()
    expect(status).not.toHaveBeenCalledWith(true)
    play.mockRejectedValueOnce(new Error('autoplay denied'))
    speech.speak({ id, text })
    await Promise.resolve()
    await Promise.resolve()
    expect(status).toHaveBeenLastCalledWith(true)
    speech.speak({ id, text })
    await Promise.resolve()
    expect(status).toHaveBeenLastCalledWith(false)
    speech.dispose()
  })
  it('reports missing recordings and cancels current speech without falling back to device TTS', () => {
    const status = vi.fn()
    const speech = new EdgeAudioProvider(status)
    speech.speak({ id, text })
    speech.speak({ text: 'unpublished recording' })
    expect(status).toHaveBeenLastCalledWith(true)
    expect(document.querySelector('audio')!.getAttribute('src')).toBeNull()
    expect(play).toHaveBeenCalledOnce()
    speech.dispose()
  })
})
