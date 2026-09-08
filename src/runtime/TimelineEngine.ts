import type { SceneDefinition } from '../schema/scene'
import type { ActionRegistry } from './ActionRegistry'
import type { RuntimeContext } from './RuntimeContext'
import { GsapTimelinePort, type TimelinePort } from './timeline/TimelinePort'

export class TimelineEngine {
  constructor(
    scene: SceneDefinition,
    registry: ActionRegistry,
    context: RuntimeContext,
    private readonly timeline: TimelinePort = new GsapTimelinePort(),
  ) {
    scene.timeline.forEach((action) => registry.schedule(action, timeline, context))
    timeline.call(() => undefined, scene.duration)
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

  getTime(): number {
    return this.timeline.getTime()
  }

  onUpdate(callback: (time: number) => void): void {
    this.timeline.setOnUpdate(() => callback(this.timeline.getTime()))
  }

  onComplete(callback: () => void): void {
    this.timeline.setOnComplete(callback)
  }

  dispose(): void {
    this.timeline.kill()
  }
}

