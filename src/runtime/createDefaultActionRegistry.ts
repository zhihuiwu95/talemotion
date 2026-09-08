import type { Sprite } from 'pixi.js'
import type { TimelineAction } from '../schema/scene'
import { ActionRegistry, type ActionHandler } from './ActionRegistry'
import type { RuntimeContext } from './RuntimeContext'
import type { TimelinePort } from './timeline/TimelinePort'

type TargetAction = Extract<TimelineAction, { target: string }>

function getTarget(context: RuntimeContext, action: TargetAction): Sprite {
  const target = context.objects.get(action.target)
  if (!target) throw new Error(`Runtime object "${action.target}" was not found`)
  return target
}

function handler<T extends TimelineAction['type']>(
  schedule: (
    action: Extract<TimelineAction, { type: T }>,
    timeline: TimelinePort,
    context: RuntimeContext,
  ) => void,
): ActionHandler<T> {
  return { schedule }
}

export function createDefaultActionRegistry(): ActionRegistry {
  return new ActionRegistry()
    .register(
      'move',
      handler((action, timeline, context) => {
        timeline.to(
          getTarget(context, action),
          {
            ...action.to,
            duration: action.duration,
            ease: action.ease ?? 'power1.inOut',
          },
          action.at,
        )
      }),
    )
    .register(
      'scale',
      handler((action, timeline, context) => {
        const scale = typeof action.to === 'number' ? { x: action.to, y: action.to } : action.to
        timeline.to(
          getTarget(context, action).scale,
          { ...scale, duration: action.duration, ease: action.ease ?? 'power1.inOut' },
          action.at,
        )
      }),
    )
    .register(
      'rotate',
      handler((action, timeline, context) => {
        timeline.to(
          getTarget(context, action),
          {
            rotation: (action.to * Math.PI) / 180,
            duration: action.duration,
            ease: action.ease ?? 'power2.inOut',
          },
          action.at,
        )
      }),
    )
    .register(
      'fade',
      handler((action, timeline, context) => {
        timeline.to(
          getTarget(context, action),
          { alpha: action.to, duration: action.duration, ease: action.ease ?? 'linear' },
          action.at,
        )
      }),
    )
    .register(
      'show',
      handler((action, timeline, context) => {
        timeline.call(() => {
          getTarget(context, action).visible = true
        }, action.at)
      }),
    )
    .register(
      'hide',
      handler((action, timeline, context) => {
        timeline.call(() => {
          getTarget(context, action).visible = false
        }, action.at)
      }),
    )
    .register(
      'camera.pan',
      handler((action, timeline, context) => {
        timeline.to(
          context.camera.position,
          {
            ...action.to,
            duration: action.duration,
            ease: action.ease ?? 'sine.inOut',
          },
          action.at,
        )
      }),
    )
    .register(
      'camera.zoom',
      handler((action, timeline, context) => {
        timeline.to(
          context.camera.scale,
          {
            x: action.to,
            y: action.to,
            duration: action.duration,
            ease: action.ease ?? 'sine.inOut',
          },
          action.at,
        )
      }),
    )
    .register(
      'effect.start',
      handler((action, timeline, context) => {
        timeline.call(() => context.effects.start(action.effect, action.params), action.at)
      }),
    )
    .register(
      'effect.stop',
      handler((action, timeline, context) => {
        timeline.call(() => context.effects.stop(action.effect), action.at)
      }),
    )
    .register(
      'expression',
      handler((action, timeline, context) => {
        timeline.call(() => context.setExpression(action.target, action.value), action.at)
      }),
    )
    .register(
      'audio.play',
      handler((action, timeline, context) => {
        timeline.call(() => context.audio.play(action), action.at)
      }),
    )
}
