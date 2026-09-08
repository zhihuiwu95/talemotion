import type { TimelineAction } from '../schema/scene'
import type { RuntimeContext } from './RuntimeContext'
import type { TimelinePort } from './timeline/TimelinePort'

type ActionType = TimelineAction['type']
type ActionFor<T extends ActionType> = Extract<TimelineAction, { type: T }>

export interface ActionHandler<T extends ActionType = ActionType> {
  schedule(action: ActionFor<T>, timeline: TimelinePort, context: RuntimeContext): void
}

export class UnknownActionError extends Error {
  constructor(actionType: string) {
    super(`No action registered for "${actionType}"`)
    this.name = 'UnknownActionError'
  }
}

export class ActionRegistry {
  private readonly handlers = new Map<ActionType, ActionHandler>()

  register<T extends ActionType>(type: T, handler: ActionHandler<T>): this {
    this.handlers.set(type, handler as unknown as ActionHandler)
    return this
  }

  schedule(
    action: TimelineAction,
    timeline: TimelinePort,
    context: RuntimeContext,
  ): void {
    const handler = this.handlers.get(action.type)
    if (!handler) throw new UnknownActionError(action.type)
    handler.schedule(action, timeline, context)
  }
}
