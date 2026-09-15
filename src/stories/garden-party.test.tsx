import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { storySchema } from './schema'
import { initialStoryState, transition } from './engine'
import raw from './packs/garden-gathering-party.json'
import { StoryBackdrop } from './StoryArt'

const pack = storySchema.parse(raw)
describe('garden party narrative continuity', () => {
  for (const test of pack.acceptance) it(test.name, () => {
    let state = initialStoryState(pack)
    const visited = []
    let nextChoice = 0
    const expectedBasket = test.choices[1] === 'flower' ? 'prop-right' : 'prop-left'
    for (let steps = 0; steps < pack.nodes.length; steps++) {
      const node = pack.nodes.find(n => n.id === state.nodeId)!
      visited.push(node)
      expect(node.backdrop).toBe('meadow-after-rain')
      expect(node.entities.map(e => e.id)).toEqual(['fox', 'cat', 'basket', 'drum'])
      if (node.id.startsWith('f') || node.id.startsWith('g')) {
        expect(node.entities.find(e => e.id === 'basket')!.slot).toBe(expectedBasket)
        expect(node.entities.find(e => e.id === 'drum')!.slot).toBe('prop-center')
      }
      if (node.id.endsWith('05c')) expect(node.interaction!.choices[0]!.target).toBe('fox')
      if (node.id.endsWith('06c')) {
        expect(node.entities.filter(e => e.motion === 'play').map(e => e.id)).toEqual(['fox', 'cat', 'drum'])
        expect('soundCue' in node && node.soundCue).toBe('drum-clap-short')
      }
      if (/^[fg](07|08|09)$/.test(node.id)) {
        expect(node).not.toHaveProperty('soundCue')
        expect(node.entities.every(e => e.motion === 'still')).toBe(true)
      }
      if (node.kind === 'ending') break
      state = transition(pack, state, node.kind === 'beat' ? { type: 'settled' } : { type: 'choose', id: test.choices[nextChoice++]! })
    }
    expect(visited).toHaveLength(18)
    expect(nextChoice).toBe(4)
    expect(visited.at(-1)!.id).toBe(test.ending)
    expect(visited.slice(-4).map(n => n.id.slice(1))).toEqual(['06', '07', '08', '09'])
    expect(visited.slice(-4).map(n => n.kind)).toEqual(['beat', 'beat', 'beat', 'ending'])
  })
  it('renders the new static backdrop without rain animation or interactive decoration', () => {
    const svg = renderToStaticMarkup(<StoryBackdrop kind="meadow-after-rain" />)
    expect(svg).toContain('viewBox="0 0 320 360"')
    expect(svg).toContain('fill="#a7ced0"')
    // Only terrain may stretch; decorative art retains its own aspect ratio.
    expect(svg.match(/preserveAspectRatio="none"/g)).toHaveLength(1)
    expect(svg).toContain('viewBox="0 0 150 90"')
    expect(svg).not.toContain('<button')
    expect(svg).not.toContain('rain-drop')
  })
})
