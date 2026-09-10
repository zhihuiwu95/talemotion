import { z } from 'zod'
import {
  assets,
  backdrops,
  catalogVersion,
  moods,
  motions,
  slots,
  styles,
} from './catalog'
import evidence from './evidence.json'

const id = z.string().regex(/^[a-z][a-z0-9-]{0,47}$/)
const text = (max: number) => z.string().trim().min(1).max(max)
const entity = z
  .object({
    id,
    asset: z.enum(assets),
    slot: z.enum(slots),
    mood: z.enum(moods),
    motion: z.enum(motions),
  })
  .strict()
const choice = z
  .object({
    id,
    target: id,
    label: text(18),
    next: id,
    outcome: z.enum(['progress', 'retry', 'choice', 'discover']),
    consequence: text(100),
  })
  .strict()
const node = z
  .object({
    id,
    kind: z.enum(['interactive', 'beat', 'ending']),
    backdrop: z.enum(backdrops),
    entities: z.array(entity).min(1).max(7),
    line: z
      .object({ speaker: text(12), text: text(64), style: z.enum(styles) })
      .strict(),
    cue: text(32),
    interaction: z
      .object({
        kind: z.enum(['goal', 'free', 'explore']),
        reason: text(140),
        choices: z.array(choice).min(1).max(3),
      })
      .strict()
      .optional(),
    next: id.optional(),
  })
  .strict()

export const storySchema = z
  .object({
    schemaVersion: z.literal('1.0'),
    catalogVersion: z.literal(catalogVersion),
    id,
    title: text(18),
    summary: text(60),
    theme: z.enum(['help', 'build', 'negotiate']),
    audience: z
      .object({
        minAge: z.number().min(3).max(6),
        maxAge: z.number().min(3).max(6),
        support: text(120),
      })
      .strict(),
    provenance: z
      .object({
        kind: z.enum(['original', 'adapted']),
        sourceTitle: text(120),
        sourceUrl: z.string().url().optional(),
        license: text(100),
        attribution: text(300),
        changes: text(300),
      })
      .strict(),
    learning: z
      .object({
        objective: text(140),
        evidenceIds: z.array(id).min(1),
        rationale: text(300),
        observation: text(180),
        offline: text(180),
        limitation: text(200),
      })
      .strict(),
    start: id,
    nodes: z.array(node).min(4).max(24),
    acceptance: z
      .array(
        z
          .object({
            name: text(60),
            choices: z.array(id).min(1).max(40),
            ending: id,
          })
          .strict(),
      )
      .min(2)
      .max(16),
  })
  .strict()
  .superRefine((story, ctx) => {
    const issue = (message: string, path: (string | number)[] = []) =>
      ctx.addIssue({ code: 'custom', message, path })
    if (
      ['mittens', 'mittens-story', 'picnic', 'hide', 'garden'].includes(
        story.id,
      )
    )
      issue('Story ID is reserved for an existing activity', ['id'])
    if (story.audience.minAge > story.audience.maxAge)
      issue('minAge must not exceed maxAge', ['audience'])
    if (story.provenance.kind === 'adapted' && !story.provenance.sourceUrl)
      issue('Adaptations require the exact source URL', ['provenance'])
    story.learning.evidenceIds.forEach((ref) => {
      if (!evidence.some((item) => item.id === ref))
        issue(`Unknown evidence ${ref}`, ['learning', 'evidenceIds'])
    })
    const nodes = new Map(story.nodes.map((n) => [n.id, n]))
    if (nodes.size !== story.nodes.length)
      issue('Duplicate node IDs', ['nodes'])
    if (!nodes.has(story.start)) issue('Start node is missing', ['start'])
    if (nodes.get(story.start)?.kind !== 'interactive')
      issue('Start must be interactive', ['start'])
    const edges = (n: (typeof story.nodes)[number]) =>
      n.next ? [n.next] : (n.interaction?.choices.map((c) => c.next) ?? [])
    story.nodes.forEach((n, i) => {
      const fail = (message: string) =>
        issue(`${n.id}: ${message}`, ['nodes', i])
      if (new Set(n.entities.map((e) => e.id)).size !== n.entities.length)
        fail('Duplicate entity IDs')
      if (new Set(n.entities.map((e) => e.slot)).size !== n.entities.length)
        fail('Entities must occupy distinct slots')
      if (n.kind === 'interactive' && (!n.interaction || n.next))
        fail('Interactive nodes require choices and prohibit auto-next')
      if (n.kind === 'beat' && (!n.next || n.interaction))
        fail('Beat nodes require auto-next and prohibit choices')
      if (n.kind === 'ending' && (n.next || n.interaction))
        fail('Endings cannot transition automatically')
      if (n.interaction) {
        if (
          new Set(n.interaction.choices.map((c) => c.id)).size !==
          n.interaction.choices.length
        )
          fail('Duplicate choice IDs')
        if (
          new Set(n.interaction.choices.map((c) => c.target)).size !==
          n.interaction.choices.length
        )
          fail('Each choice needs a distinct target')
        for (const c of n.interaction.choices) {
          if (!n.entities.some((e) => e.id === c.target))
            fail(`Missing target ${c.target}`)
          if (
            n.entities.find((e) => e.id === c.target)?.slot.startsWith('sky-')
          )
            fail(
              'Sky slots are display-only; use a ground or actor slot for touch targets',
            )
          if (n.interaction.kind !== 'goal' && c.outcome === 'retry')
            fail('Free choice and exploration cannot have wrong answers')
          if (n.interaction.kind === 'free' && c.outcome !== 'choice')
            fail('Free choices must use outcome choice')
        }
      }
      for (const next of edges(n))
        if (!nodes.has(next)) fail(`Missing destination ${next}`)
      // A muted player must never spin in an automatic loop.
      let auto: typeof n | undefined = n
      const seen = new Set<string>()
      while (auto?.kind === 'beat') {
        if (seen.has(auto.id)) {
          fail('Automatic cycle')
          break
        }
        seen.add(auto.id)
        auto = nodes.get(auto.next!)
      }
    })
    const reachable = new Set<string>()
    const visit = (key: string) => {
      if (reachable.has(key)) return
      reachable.add(key)
      const n = nodes.get(key)
      if (n) edges(n).forEach(visit)
    }
    visit(story.start)
    const terminating = new Set(
      story.nodes.filter((n) => n.kind === 'ending').map((n) => n.id),
    )
    for (let pass = 0; pass < story.nodes.length; pass++)
      for (const n of story.nodes)
        if (edges(n).some((key) => terminating.has(key))) terminating.add(n.id)
    for (const n of story.nodes) {
      if (!reachable.has(n.id)) issue(`Unreachable node ${n.id}`, ['nodes'])
      if (!terminating.has(n.id))
        issue(`No route to an ending from ${n.id}`, ['nodes'])
    }
    for (const test of story.acceptance)
      if (nodes.get(test.ending)?.kind !== 'ending')
        issue(`Acceptance ending ${test.ending} is not an ending`, [
          'acceptance',
        ])
  })
export type StoryPack = z.infer<typeof storySchema>
export type StoryNode = StoryPack['nodes'][number]
export type StoryEntity = StoryNode['entities'][number]
