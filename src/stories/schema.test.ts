import { describe, expect, it } from 'vitest'
import { storySchema } from './schema'
import { initialStoryState, transition, verifyAcceptance } from './engine'
import snow from './packs/snow-mittens.json'
import { storyPacks } from './library'

describe('story production contract', () => {
  it('all shipped packs cover every node and every choice through executable acceptance paths', () => {
    expect(storyPacks.length).toBeGreaterThanOrEqual(3)
    for (const pack of storyPacks)
      expect(verifyAcceptance(pack), pack.id).toEqual([])
  })
  it.each([
    [
      'unknown asset',
      (pack: typeof snow) => {
        pack.nodes[0]!.entities[0]!.asset = 'invented-dragon'
      },
    ],
    [
      'unknown evidence',
      (pack: typeof snow) => {
        pack.learning.evidenceIds = ['invented-study']
      },
    ],
    [
      'missing destination',
      (pack: typeof snow) => {
        pack.nodes[0]!.interaction!.choices[0]!.next = 'missing'
      },
    ],
    [
      'invisible action target',
      (pack: typeof snow) => {
        pack.nodes[0]!.interaction!.choices[0]!.target = 'missing'
      },
    ],
    [
      'overlapping positions',
      (pack: typeof snow) => {
        pack.nodes[0]!.entities[1]!.slot = pack.nodes[0]!.entities[0]!.slot
      },
    ],
    [
      'small sky touch target',
      (pack: typeof snow) => {
        pack.nodes[0]!.entities[0]!.slot = 'sky-left'
      },
    ],
    [
      'unreachable node',
      (pack: typeof snow) => {
        pack.nodes.push({ ...pack.nodes[0]!, id: 'orphan' })
      },
    ],
    [
      'automatic cycle',
      (pack: typeof snow) => {
        pack.nodes.find((n) => n.id === 'bird')!.next = 'bird'
      },
    ],
    [
      'free choice judged wrong',
      (pack: typeof snow) => {
        pack.nodes.find(
          (n) => n.id === 'play',
        )!.interaction!.choices[0]!.outcome = 'retry'
      },
    ],
  ])(
    'rejects %s instead of silently rendering a broken story',
    (_name, mutate) => {
      const draft = structuredClone(snow)
      mutate(draft)
      expect(storySchema.safeParse(draft).success).toBe(false)
    },
  )
  it('rejects a reachable interaction trap with no ending', () => {
    const draft = structuredClone(snow)
    for (const c of draft.nodes.find((n) => n.id === 'play')!.interaction!
      .choices)
      c.next = 'play'
    expect(storySchema.safeParse(draft).success).toBe(false)
  })
  it('reports incomplete and invalid author-supplied acceptance cases', () => {
    const pack = storySchema.parse(snow)
    pack.acceptance = [pack.acceptance[0]!]
    expect(
      verifyAcceptance(pack).some((error) =>
        error.includes('No acceptance path'),
      ),
    ).toBe(true)
    pack.acceptance[0]!.choices = ['not-a-choice']
    expect(
      verifyAcceptance(pack).some((error) => error.includes('invalid choice')),
    ).toBe(true)
  })
  it('ignores choices outside the active scene and resets retry/choice history on replay', () => {
    const pack = storySchema.parse(snow)
    const state = initialStoryState(pack)
    expect(transition(pack, state, { type: 'choose', id: 'red' })).toBe(state)
    expect(transition(pack, state, { type: 'settled' })).toBe(state)
    const played = transition(pack, state, { type: 'choose', id: 'ask' })
    expect(played.choices).toEqual(['ask'])
    expect(initialStoryState(pack)).toEqual(state)
  })
})
