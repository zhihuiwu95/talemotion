import { describe, expect, it, vi } from 'vitest'
import type { Sprite } from 'pixi.js'
import { parseScene } from '../schema/scene'
import { RecordingTimeline } from '../test/RecordingTimeline'
import { createDefaultActionRegistry } from './createDefaultActionRegistry'
import type { RuntimeContext } from './RuntimeContext'
import { TimelineEngine } from './TimelineEngine'

const scene = parseScene({
  version: '1.0',
  sceneId: 'timeline-test',
  title: 'Timeline test',
  duration: 3,
  viewport: { width: 100, height: 100 },
  assets: { hero: '/hero.svg' },
  objects: [
    {
      id: 'hero',
      type: 'sprite',
      asset: 'hero',
      x: 0,
      y: 0,
      anchor: [0, 0],
    },
  ],
  timeline: [
    {
      at: 0.5,
      type: 'move',
      target: 'hero',
      to: { x: 80 },
      duration: 1.5,
    },
  ],
  captions: [],
})

describe('TimelineEngine', () => {
  it('schedules absolute actions at JSON-defined times and preserves scene duration', () => {
    const recording = new RecordingTimeline()
    const hero = { x: 0, y: 0 } as Sprite
    const context = {
      objects: new Map([['hero', hero]]),
    } as unknown as RuntimeContext

    new TimelineEngine(scene, createDefaultActionRegistry(), context, recording)

    expect(recording.tweens).toHaveLength(1)
    expect(recording.tweens[0]).toMatchObject({
      target: hero,
      position: 0.5,
      properties: { x: 80, duration: 1.5 },
    })
    expect(recording.calls.at(-1)?.position).toBe(3)
  })

  it('reports the timeline clock through its update callback', () => {
    const recording = new RecordingTimeline()
    const context = {
      objects: new Map([['hero', { x: 0, y: 0 } as Sprite]]),
    } as unknown as RuntimeContext
    const engine = new TimelineEngine(scene, createDefaultActionRegistry(), context, recording)
    const onUpdate = vi.fn()

    engine.onUpdate(onUpdate)
    recording.update(1.25)

    expect(onUpdate).toHaveBeenCalledWith(1.25)
  })
})
