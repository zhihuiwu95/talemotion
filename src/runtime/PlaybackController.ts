import type { TimelineEngine } from './TimelineEngine'

export type PlaybackState = 'ready' | 'playing' | 'paused' | 'complete'

export interface PlaybackLifecycle {
  pause(): void
  resume(): void
  reset(): void
  dispose(): void
}

export class PlaybackController {
  private state: PlaybackState = 'ready'

  constructor(
    private readonly timeline: TimelineEngine,
    private readonly lifecycle: PlaybackLifecycle,
    private readonly onStateChange: (state: PlaybackState) => void = () => undefined,
  ) {
    timeline.onComplete(() => {
      this.state = 'complete'
      this.lifecycle.pause()
      this.onStateChange(this.state)
    })
  }

  get playbackState(): PlaybackState {
    return this.state
  }

  play(): void {
    if (this.state === 'complete') {
      this.restart()
      return
    }
    this.lifecycle.resume()
    this.timeline.play()
    this.setState('playing')
  }

  pause(): void {
    if (this.state !== 'playing') return
    this.timeline.pause()
    this.lifecycle.pause()
    this.setState('paused')
  }

  restart(): void {
    this.timeline.pause()
    this.timeline.seek(0, true)
    this.lifecycle.reset()
    this.timeline.invalidate()
    this.lifecycle.resume()
    this.timeline.restart()
    this.setState('playing')
  }

  dispose(): void {
    this.timeline.dispose()
    this.lifecycle.dispose()
  }

  private setState(state: PlaybackState): void {
    this.state = state
    this.onStateChange(state)
  }
}

