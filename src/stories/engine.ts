import type { StoryPack } from './schema'

export interface StoryState {
  nodeId: string
  visits: number
  choices: string[]
  retries: number
}
export const initialStoryState = (pack: StoryPack): StoryState => ({
  nodeId: pack.start,
  visits: 0,
  choices: [],
  retries: 0,
})
export function transition(
  pack: StoryPack,
  state: StoryState,
  action: { type: 'choose'; id: string } | { type: 'settled' },
): StoryState {
  const node = pack.nodes.find((n) => n.id === state.nodeId)!
  if (action.type === 'settled')
    return node.kind === 'beat' && node.next
      ? { ...state, nodeId: node.next, visits: state.visits + 1 }
      : state
  const choice =
    node.kind === 'interactive'
      ? node.interaction?.choices.find((c) => c.id === action.id)
      : undefined
  return choice
    ? {
        nodeId: choice.next,
        visits: state.visits + 1,
        choices: [...state.choices, action.id],
        retries: state.retries + Number(choice.outcome === 'retry'),
      }
    : state
}

/** Deterministic path checks, independent of narration and rendering. */
export function verifyAcceptance(pack: StoryPack): string[] {
  const errors: string[] = []
  const coveredNodes = new Set<string>()
  const coveredChoices = new Set<string>()
  for (const test of pack.acceptance) {
    let state = initialStoryState(pack)
    const settle = () => {
      for (let steps = 0; steps <= pack.nodes.length; steps++) {
        coveredNodes.add(state.nodeId)
        const next = transition(pack, state, { type: 'settled' })
        if (next === state) return
        state = next
      }
      errors.push(`${test.name}: automatic cycle`)
    }
    settle()
    for (const id of test.choices) {
      const before = state
      state = transition(pack, state, { type: 'choose', id })
      if (state === before) {
        errors.push(`${test.name}: invalid choice ${id} at ${state.nodeId}`)
        break
      }
      coveredChoices.add(`${before.nodeId}/${id}`)
      settle()
    }
    if (state.nodeId !== test.ending)
      errors.push(`${test.name}: expected ${test.ending}, got ${state.nodeId}`)
  }
  for (const n of pack.nodes) {
    if (!coveredNodes.has(n.id))
      errors.push(`No acceptance path visits ${n.id}`)
    for (const c of n.interaction?.choices ?? [])
      if (!coveredChoices.has(`${n.id}/${c.id}`))
        errors.push(`No acceptance path covers ${n.id}/${c.id}`)
  }
  return errors
}
