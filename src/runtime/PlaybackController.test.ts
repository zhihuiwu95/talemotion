import { describe, expect, it, vi } from 'vitest'
import type { TimelineEngine } from './TimelineEngine'
import { PlaybackController, type PlaybackLifecycle } from './PlaybackController'

function createFixture() {
  let onComplete: () => void = () => undefined
  const timeline = {
    onComplete: vi.fn((callback: () => void) => {
      onComplete = callback
    }),
    play: vi.fn(),
    pause: vi.fn(),
    seek: vi.fn(),
    restart: vi.fn(),
    invalidate: vi.fn(),
    dispose: vi.fn(),
  } as unknown as TimelineEngine
  const lifecycle: PlaybackLifecycle = {
    pause: vi.fn(),
    resume: vi.fn(),
    reset: vi.fn(),
    dispose: vi.fn(),
  }
  const onStateChange = vi.fn()
  const controller = new PlaybackController(timeline, lifecycle, onStateChange)

  return { controller, timeline, lifecycle, onStateChange, complete: () => onComplete() }
}

describe('PlaybackController', () => {
  it('coordinates play and pause with runtime resources', () => {
    const { controller, timeline, lifecycle, onStateChange } = createFixture()

    controller.play()
    controller.pause()

    expect(lifecycle.resume).toHaveBeenCalledTimes(1)
    expect(timeline.play).toHaveBeenCalledTimes(1)
    expect(timeline.pause).toHaveBeenCalledTimes(1)
    expect(lifecycle.pause).toHaveBeenCalledTimes(1)
    expect(onStateChange).toHaveBeenNthCalledWith(1, 'playing')
    expect(onStateChange).toHaveBeenNthCalledWith(2, 'paused')
  })

  it('restores initial state on every restart without accumulating changes', () => {
    const { controller, timeline, lifecycle } = createFixture()

    controller.restart()
    controller.restart()

    expect(timeline.pause).toHaveBeenCalledTimes(2)
    expect(timeline.seek).toHaveBeenNthCalledWith(1, 0, true)
    expect(timeline.seek).toHaveBeenNthCalledWith(2, 0, true)
    expect(lifecycle.reset).toHaveBeenCalledTimes(2)
    expect(timeline.invalidate).toHaveBeenCalledTimes(2)
    expect(timeline.restart).toHaveBeenCalledTimes(2)
    expect(controller.playbackState).toBe('playing')
  })

  it('marks the scene complete and replays it through the restart path', () => {
    const { controller, timeline, lifecycle, complete } = createFixture()

    controller.play()
    complete()
    expect(controller.playbackState).toBe('complete')

    controller.play()

    expect(lifecycle.reset).toHaveBeenCalledTimes(1)
    expect(timeline.restart).toHaveBeenCalledTimes(1)
    expect(controller.playbackState).toBe('playing')
  })
})
