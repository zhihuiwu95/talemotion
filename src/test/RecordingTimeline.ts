import type { TimelinePort, TweenProperties } from '../runtime/timeline/TimelinePort'

export interface RecordedTween {
  target: object
  properties: TweenProperties
  position: number
}

export interface RecordedCall {
  callback: () => void
  position: number
}

export class RecordingTimeline implements TimelinePort {
  readonly tweens: RecordedTween[] = []
  readonly calls: RecordedCall[] = []
  readonly operations: string[] = []
  private time = 0
  private updateCallback: () => void = () => undefined
  private completeCallback: () => void = () => undefined

  to(target: object, properties: TweenProperties, position: number): void {
    this.tweens.push({ target, properties, position })
  }

  call(callback: () => void, position: number): void {
    this.calls.push({ callback, position })
  }

  play(): void {
    this.operations.push('play')
  }

  pause(): void {
    this.operations.push('pause')
  }

  seek(time: number, suppressEvents = false): void {
    this.time = time
    this.operations.push(`seek:${time}:${suppressEvents}`)
  }

  restart(): void {
    this.operations.push('restart')
  }

  invalidate(): void {
    this.operations.push('invalidate')
  }

  kill(): void {
    this.operations.push('kill')
  }

  getTime(): number {
    return this.time
  }

  setOnUpdate(callback: () => void): void {
    this.updateCallback = callback
  }

  setOnComplete(callback: () => void): void {
    this.completeCallback = callback
  }

  update(time: number): void {
    this.time = time
    this.updateCallback()
  }

  complete(): void {
    this.completeCallback()
  }
}
