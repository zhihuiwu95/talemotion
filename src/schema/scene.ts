import { z } from 'zod'

const finiteNumber = z.number().finite()
const nonNegative = finiteNumber.nonnegative()
const duration = finiteNumber.positive()
const actionBase = {
  id: z.string().min(1).optional(),
  at: nonNegative,
  label: z.string().min(1).optional(),
}
const tweenBase = {
  ...actionBase,
  duration,
  ease: z
    .enum(['linear', 'power1.inOut', 'power2.inOut', 'sine.inOut'])
    .optional(),
}

const moveActionSchema = z
  .object({
    ...tweenBase,
    type: z.literal('move'),
    target: z.string().min(1),
    to: z
      .object({
        x: finiteNumber.optional(),
        y: finiteNumber.optional(),
      })
      .strict()
      .refine(({ x, y }) => x !== undefined || y !== undefined, {
        message: 'move.to must include x or y',
      }),
  })
  .strict()

const scaleActionSchema = z
  .object({
    ...tweenBase,
    type: z.literal('scale'),
    target: z.string().min(1),
    to: z.union([
      finiteNumber.nonnegative(),
      z
        .object({ x: finiteNumber.nonnegative(), y: finiteNumber.nonnegative() })
        .strict(),
    ]),
  })
  .strict()

const rotateActionSchema = z
  .object({
    ...tweenBase,
    type: z.literal('rotate'),
    target: z.string().min(1),
    to: finiteNumber,
  })
  .strict()

const fadeActionSchema = z
  .object({
    ...tweenBase,
    type: z.literal('fade'),
    target: z.string().min(1),
    to: finiteNumber.min(0).max(1),
  })
  .strict()

const showActionSchema = z
  .object({
    ...actionBase,
    type: z.literal('show'),
    target: z.string().min(1),
  })
  .strict()

const hideActionSchema = z
  .object({
    ...actionBase,
    type: z.literal('hide'),
    target: z.string().min(1),
  })
  .strict()

const cameraPanActionSchema = z
  .object({
    ...tweenBase,
    type: z.literal('camera.pan'),
    to: z
      .object({
        x: finiteNumber.optional(),
        y: finiteNumber.optional(),
      })
      .strict()
      .refine(({ x, y }) => x !== undefined || y !== undefined, {
        message: 'camera.pan.to must include x or y',
      }),
  })
  .strict()

const cameraZoomActionSchema = z
  .object({
    ...tweenBase,
    type: z.literal('camera.zoom'),
    to: finiteNumber.positive().max(4),
  })
  .strict()

const effectStartActionSchema = z
  .object({
    ...actionBase,
    type: z.literal('effect.start'),
    effect: z.enum(['snow']),
    params: z
      .object({
        density: finiteNumber.min(0).max(1).optional(),
      })
      .strict()
      .optional(),
  })
  .strict()

const effectStopActionSchema = z
  .object({
    ...actionBase,
    type: z.literal('effect.stop'),
    effect: z.enum(['snow']),
  })
  .strict()

const expressionActionSchema = z
  .object({
    ...actionBase,
    type: z.literal('expression'),
    target: z.string().min(1),
    value: z.string().min(1),
  })
  .strict()

const audioPlayActionSchema = z
  .object({
    ...actionBase,
    type: z.literal('audio.play'),
    channel: z.enum(['narration', 'character', 'sfx', 'bgm']),
    asset: z.string().min(1).optional(),
    text: z.string().min(1).optional(),
    voice: z.string().min(1).optional(),
    lang: z.string().min(2).optional(),
    rate: finiteNumber.min(0.5).max(2).optional(),
    pitch: finiteNumber.min(0).max(2).optional(),
  })
  .strict()
  .refine(({ asset, text }) => asset !== undefined || text !== undefined, {
    message: 'audio.play requires an asset or text',
  })

export const TimelineActionSchema = z.discriminatedUnion('type', [
  moveActionSchema,
  scaleActionSchema,
  rotateActionSchema,
  fadeActionSchema,
  showActionSchema,
  hideActionSchema,
  cameraPanActionSchema,
  cameraZoomActionSchema,
  effectStartActionSchema,
  effectStopActionSchema,
  expressionActionSchema,
  audioPlayActionSchema,
])

export const SceneObjectSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('sprite'),
    asset: z.string().min(1),
    x: finiteNumber,
    y: finiteNumber,
    width: duration.optional(),
    height: duration.optional(),
    anchor: z.tuple([finiteNumber.min(0).max(1), finiteNumber.min(0).max(1)]),
    scale: z
      .union([
        finiteNumber.nonnegative(),
        z.tuple([finiteNumber.nonnegative(), finiteNumber.nonnegative()]),
      ])
      .optional(),
    rotation: finiteNumber.optional(),
    alpha: finiteNumber.min(0).max(1).optional(),
    visible: z.boolean().optional(),
    zIndex: finiteNumber.optional(),
    expressions: z.record(z.string(), z.string()).optional(),
  })
  .strict()

export const CaptionSchema = z
  .object({
    start: nonNegative,
    end: duration,
    text: z.string().min(1),
    speaker: z.string().min(1).optional(),
  })
  .strict()
  .refine(({ start, end }) => end > start, {
    message: 'caption end must be after start',
  })

const RawSceneSchema = z
  .object({
    version: z.literal('1.0'),
    sceneId: z.string().min(1),
    title: z.string().min(1),
    duration,
    viewport: z
      .object({ width: duration, height: duration })
      .strict(),
    assets: z.record(z.string(), z.string().min(1)),
    objects: z.array(SceneObjectSchema).min(1),
    timeline: z.array(TimelineActionSchema),
    captions: z.array(CaptionSchema).default([]),
  })
  .strict()

type SceneDraft = z.infer<typeof RawSceneSchema>

const targetActionTypes = new Set([
  'move',
  'scale',
  'rotate',
  'fade',
  'show',
  'hide',
  'expression',
])

export const SceneSchema = RawSceneSchema.superRefine((scene, context) => {
  const objectIds = new Set<string>()
  const objectById = new Map(scene.objects.map((object) => [object.id, object]))

  scene.objects.forEach((object, index) => {
    if (objectIds.has(object.id)) {
      context.addIssue({
        code: 'custom',
        path: ['objects', index, 'id'],
        message: `duplicate object id: ${object.id}`,
      })
    }
    objectIds.add(object.id)

    if (!(object.asset in scene.assets)) {
      context.addIssue({
        code: 'custom',
        path: ['objects', index, 'asset'],
        message: `unknown asset: ${object.asset}`,
      })
    }

    Object.entries(object.expressions ?? {}).forEach(([expression, asset]) => {
      if (!(asset in scene.assets)) {
        context.addIssue({
          code: 'custom',
          path: ['objects', index, 'expressions', expression],
          message: `unknown expression asset: ${asset}`,
        })
      }
    })
  })

  scene.timeline.forEach((action, index) => {
    const actionEnd = 'duration' in action ? action.at + action.duration : action.at
    if (actionEnd > scene.duration) {
      context.addIssue({
        code: 'custom',
        path: ['timeline', index],
        message: `action exceeds scene duration (${scene.duration}s)`,
      })
    }

    if (targetActionTypes.has(action.type) && 'target' in action) {
      const target = objectById.get(action.target)
      if (!target) {
        context.addIssue({
          code: 'custom',
          path: ['timeline', index, 'target'],
          message: `unknown target: ${action.target}`,
        })
      } else if (
        action.type === 'expression' &&
        !(action.value in (target.expressions ?? {}))
      ) {
        context.addIssue({
          code: 'custom',
          path: ['timeline', index, 'value'],
          message: `unknown expression "${action.value}" for ${action.target}`,
        })
      }
    }

    if (action.type === 'audio.play' && action.asset && !(action.asset in scene.assets)) {
      context.addIssue({
        code: 'custom',
        path: ['timeline', index, 'asset'],
        message: `unknown audio asset: ${action.asset}`,
      })
    }
  })

  scene.captions.forEach((caption, index) => {
    if (caption.end > scene.duration) {
      context.addIssue({
        code: 'custom',
        path: ['captions', index, 'end'],
        message: `caption exceeds scene duration (${scene.duration}s)`,
      })
    }
  })
})

export type SceneDefinition = z.infer<typeof SceneSchema>
export type SceneObjectDefinition = z.infer<typeof SceneObjectSchema>
export type TimelineAction = z.infer<typeof TimelineActionSchema>
export type SceneInput = SceneDraft

export function parseScene(input: unknown): SceneDefinition {
  return SceneSchema.parse(input)
}
