import { gsap } from 'gsap'

export type TweenProperties = Record<string, unknown>

export interface TimelinePort {
  to(target: object, properties: TweenProperties, position: number): void
  call(callback: () => void, position: number): void
  play(): void
  pause(): void
  seek(time: number, suppressEvents?: boolean): void
  restart(): void
  invalidate(): void
  kill(): void
  getTime(): number
  setOnUpdate(callback: () => void): void
  setOnComplete(callback: () => void): void
}

export class GsapTimelinePort implements TimelinePort {
  private readonly timeline = gsap.timeline({ paused: true })

  to(target: object, properties: TweenProperties, position: number): void {
    this.timeline.to(target, properties, position)
  }

  call(callback: () => void, position: number): void {
    this.timeline.call(callback, undefined, position)
  }

  play(): void {
    this.timeline.play()
  }

  pause(): void {
    this.timeline.pause()
  }

  seek(time: number, suppressEvents = false): void {
    this.timeline.seek(time, suppressEvents)
  }

  restart(): void {
    this.timeline.restart()
  }

  invalidate(): void {
    this.timeline.invalidate()
  }

  kill(): void {
    this.timeline.kill()
  }

  getTime(): number {
    return this.timeline.time()
  }

  setOnUpdate(callback: () => void): void {
    this.timeline.eventCallback('onUpdate', callback)
  }

  setOnComplete(callback: () => void): void {
    this.timeline.eventCallback('onComplete', callback)
  }
}

