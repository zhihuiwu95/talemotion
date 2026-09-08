import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import manifest from '../../generated/narration.json'
import { EdgeAudioProvider } from './EdgeAudioProvider'

const text = Object.keys(manifest.clips)[0]!
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
  it('starts immediately on the caller gesture, reuses the element and disposes it', async () => {
    const status = vi.fn()
    const speech = new EdgeAudioProvider(status)
    speech.speak({ text })
    expect(play).toHaveBeenCalledOnce()
    const element = document.querySelector('audio')!
    expect(element.src).toContain('/audio/')
    await Promise.resolve()
    expect(status).toHaveBeenLastCalledWith(false)
    speech.speak({ text })
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
    speech.speak({ text })
    speech.speak({ text })
    rejectOld(new Error('old request aborted'))
    await Promise.resolve()
    await Promise.resolve()
    expect(status).not.toHaveBeenCalledWith(true)
    play.mockRejectedValueOnce(new Error('autoplay denied'))
    speech.speak({ text })
    await Promise.resolve()
    await Promise.resolve()
    expect(status).toHaveBeenLastCalledWith(true)
    speech.speak({ text })
    await Promise.resolve()
    expect(status).toHaveBeenLastCalledWith(false)
    speech.dispose()
  })
  it('reports missing recordings and cancels current speech without falling back to device TTS', () => {
    const status = vi.fn()
    const speech = new EdgeAudioProvider(status)
    speech.speak({ text })
    speech.speak({ text: 'unpublished recording' })
    expect(status).toHaveBeenLastCalledWith(true)
    expect(document.querySelector('audio')!.getAttribute('src')).toBeNull()
    expect(play).toHaveBeenCalledOnce()
    speech.dispose()
  })
})
