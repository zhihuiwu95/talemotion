import { describe, expect, it } from 'vitest'
import type { TimelineAction } from '../schema/scene'
import { RecordingTimeline } from '../test/RecordingTimeline'
import { ActionRegistry, UnknownActionError } from './ActionRegistry'
import type { RuntimeContext } from './RuntimeContext'

describe('ActionRegistry', () => {
  it('dispatches a registered action handler', () => {
    const registry = new ActionRegistry()
    const timeline = new RecordingTimeline()
    const action: TimelineAction = {
      at: 1,
      type: 'move',
      target: 'hero',
      to: { x: 50 },
      duration: 2,
    }
    let dispatched: TimelineAction | undefined

    registry.register('move', {
      schedule: (received) => {
        dispatched = received
      },
    })
    registry.schedule(action, timeline, {} as RuntimeContext)

    expect(dispatched).toBe(action)
  })

  it('fails closed when an action has no registered handler', () => {
    const registry = new ActionRegistry()
    const unknown = { at: 0, type: 'run.javascript' } as unknown as TimelineAction

    expect(() =>
      registry.schedule(unknown, new RecordingTimeline(), {} as RuntimeContext),
    ).toThrow(UnknownActionError)
  })
})

