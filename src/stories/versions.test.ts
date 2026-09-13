import { describe, expect, it } from 'vitest'
import exportedSchema from '../../docs/production/story.schema.json'
import exportedCapabilities from '../../docs/production/capabilities.json'
import { z } from 'zod'
import { storySchema, storyV1Schema, storyV1_1Schema } from './schema'
import { capabilityExport } from './catalog'
import { verifyAcceptance } from './engine'
import snow from './packs/snow-mittens.json'

function fixture(version: '1.0' | '1.1', count = 4, autoStart = false) {
  const nodes = Array.from({ length: count }, (_, i) => {
    const base = {
      id: `n${i}`, backdrop: 'meadow',
      entities: [{ id: 'fox', asset: 'fox', slot: 'actor-left', mood: 'neutral', motion: 'still' }],
      line: { speaker: '小狐狸', text: '一起玩吧！' }, cue: '看一看',
    }
    if (i === count - 1) return { ...base, kind: 'ending' }
    if (i === (autoStart ? 1 : 0)) return {
      ...base, kind: 'interactive', interaction: {
        kind: 'free', reason: '邀请朋友一起玩',
        choices: [{ id: 'go', target: 'fox', label: '一起玩', next: `n${i + 1}`, outcome: 'choice', consequence: '朋友加入' }],
      },
    }
    return { ...base, kind: 'beat', next: `n${i + 1}` }
  })
  return { ...structuredClone(snow), schemaVersion: version, catalogVersion: version,
    start: 'n0', nodes,
    acceptance: ['first', 'again'].map(name => ({ name, choices: ['go'], ending: `n${count - 1}` })),
  }
}

interface SchemaObject {
  const?: unknown
  enum?: readonly unknown[]
  maxItems?: number
  properties?: Record<string, SchemaObject>
  items?: SchemaObject | SchemaObject[] | boolean
  additionalProperties?: boolean
}
function object(value: unknown): SchemaObject {
  if (!value || typeof value !== 'object') throw new Error('Expected JSON Schema object')
  return value as SchemaObject
}

describe('explicit version contracts', () => {
  it.each([['1.0', 24, true], ['1.0', 25, false], ['1.1', 40, true], ['1.1', 41, false]] as const)(
    '%s accepts %i nodes: %s', (version, count, valid) => {
      const parsed = storySchema.safeParse(fixture(version, count))
      expect(parsed.success).toBe(valid)
      if (parsed.success) expect(verifyAcceptance(parsed.data)).toEqual([])
      else expect(parsed.error.issues).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'too_big', path: ['nodes'] })]))
    },
  )
  it('keeps concrete exported versions independently validated and permits automatic opening only in 1.1', () => {
    expect(storyV1Schema.safeParse(fixture('1.0', 4, true)).success).toBe(false)
    const result = storyV1_1Schema.parse(fixture('1.1', 4, true))
    expect(verifyAcceptance(result)).toEqual([])
    expect(storyV1Schema.safeParse(fixture('1.1')).success).toBe(false)
    expect(storyV1_1Schema.safeParse(fixture('1.0')).success).toBe(false)
  })
  it.each(['1.0', '1.1'] as const)('rejects ending starts and auto cycles in %s', version => {
    const ending = fixture(version)
    ending.start = 'n3'
    expect(storySchema.safeParse(ending).success).toBe(false)
    const cycle = fixture(version)
    cycle.nodes[2] = { ...cycle.nodes[2]!, next: 'n2' }
    expect(storySchema.safeParse(cycle).success).toBe(false)
  })
  it('rejects unknown and mixed versions', () => {
    for (const [schemaVersion, catalogVersion] of [['1.0', '1.1'], ['1.1', '1.0'], ['2.0', '2.0'], ['1.1', 'latest']]) {
      expect(storySchema.safeParse({ ...fixture('1.1'), schemaVersion, catalogVersion }).success).toBe(false)
    }
  })
  it('isolates new backdrop and registered cue IDs from 1.0', () => {
    for (const patch of [{ backdrop: 'meadow-after-rain' }, { soundCue: 'drum-short' }, { soundCue: 'drum-clap-short' }]) {
      for (const version of ['1.0', '1.1'] as const) {
        const draft = fixture(version)
        const input = { ...draft, nodes: draft.nodes.map((n, i) => i === 0 ? { ...n, ...patch } : n) }
        expect(storySchema.safeParse(input).success).toBe(version === '1.1')
      }
    }
    const draft = fixture('1.1')
    for (const soundCue of ['unknown', 'https://example.com/a.mp3', '../sound.wav', { id: 'drum-short' }]) {
      expect(storySchema.safeParse({ ...draft, nodes: draft.nodes.map(n => ({ ...n, soundCue })) }).success).toBe(false)
    }
  })
  it('exports explicit shapes with version limits and capability enums, including strict legacy nodes', () => {
    const exported = z.toJSONSchema(storySchema)
    expect(exportedSchema).toEqual(exported)
    const branches = exported.oneOf ?? exported.anyOf
    expect(branches).toHaveLength(2)
    for (const branch of branches!) {
      const props = branch.properties!
      const version = object(props.schemaVersion).const
      expect(object(props.catalogVersion).const).toBe(version)
      expect(object(props.nodes).maxItems).toBe(version === '1.0' ? 24 : 40)
      const item = object(props.nodes).items
      if (!item || Array.isArray(item) || typeof item === 'boolean') throw new Error('Expected a concrete node schema')
      expect(item.additionalProperties).toBe(false)
      expect(object(item.properties!.backdrop).enum).toEqual(capabilityExport.catalogs[version as '1.0' | '1.1'].backdrops)
      if (version === '1.0') expect(item.properties).not.toHaveProperty('soundCue')
      else expect(object(item.properties!.soundCue).enum).toEqual(capabilityExport.catalogs['1.1'].soundCues)
    }
    expect(exportedCapabilities).toEqual(capabilityExport)
    expect(capabilityExport.catalogs['1.0'].soundCues).toEqual([])
    expect(capabilityExport).not.toHaveProperty('backdrops')
  })
})
