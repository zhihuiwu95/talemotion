import { describe, expect, it } from 'vitest'
import { collectLine } from './narration'
import { speechLineSchema } from '../src/stories/speech'

describe('speaker-aware narration collection', () => {
  it('keeps same text with different speakers and emotions as distinct clips', () => {
    const line = { text: '一起玩吧！', speaker: '小熊', emotion: 'warm' as const }
    const bear = collectLine('test:node', line)
    const fox = collectLine('test:node', { ...line, speaker: '小狐狸' })
    const excited = collectLine('test:node', { ...line, emotion: 'excited' })
    expect(new Set([bear.id, fox.id, excited.id]).size).toBe(3)
    expect(bear).toMatchObject({ speaker: 'bear', speakerLabel: '小熊', voiceProfile: 'bear', intent: 'dialogue', emotion: 'warm' })
    expect(collectLine('test:node', line).id).toBe(bear.id)
  })
  it('preserves scoped pronunciation in clip identity and rejects ambiguous or unsafe annotations', () => {
    const line = { speaker: '朵朵', text: '小熊少了一只手套。' }
    const marked = { ...line, segments: [{ text: line.text, pronunciations: [{ text: '少', phoneme: 'shao3' }] }] }
    expect(collectLine('test', marked).id).not.toBe(collectLine('test', line).id)
    expect(collectLine('test', marked).segments).toEqual(marked.segments)
    for (const pronunciations of [
      [{ text: '少', phoneme: '<audio/>' }],
      [{ text: '没有', phoneme: 'shao3' }],
      [{ text: '少', phoneme: 'shao3' }, { text: '少了', phoneme: 'shao3 le5' }],
    ]) expect(speechLineSchema.safeParse({ ...line, segments: [{ text: line.text, pronunciations }] }).success).toBe(false)
    expect(speechLineSchema.safeParse({ speaker: '朵朵', text: '少少', segments: [{ text: '少少', pronunciations: [{ text: '少', phoneme: 'shao3' }] }] }).success).toBe(false)
  })
  it('selects repeated words by occurrence without adding rhythm segments', () => {
    const line = { speaker: '朵朵', text: '一只手套，只要找到它。', segments: [{ text: '一只手套，只要找到它。', pronunciations: [
      { text: '只', phoneme: 'zhi1', occurrence: 1 }, { text: '只', phoneme: 'zhi3', occurrence: 2 },
    ] }] }
    expect(speechLineSchema.safeParse(line).success).toBe(true)
    expect(collectLine('test', line).segments).toHaveLength(1)
    for (const occurrence of [0, 3, 1.5]) expect(speechLineSchema.safeParse({ ...line, segments: [{ text: line.text, pronunciations: [{ text: '只', phoneme: 'zhi1', occurrence }] }] }).success).toBe(false)
  })
  it('separates source locations and resolves legacy styles without forcing them on a voice', () => {
    const line = { speaker: '朵朵警官', text: '再看看吧。', style: 'empathetic' }
    expect(collectLine('one', line)).toMatchObject({ emotion: 'empathetic', voiceProfile: 'duoduo' })
    expect(collectLine('one', line).style).toBeUndefined()
    expect(collectLine('one', line).id).not.toBe(collectLine('two', line).id)
    expect(() => collectLine('one', { ...line, speaker: '未登记' })).toThrow(/Register speaker/)
    expect(() => collectLine('one', { ...line, voiceProfile: 'unknown' })).toThrow(/Unknown voice profile/)
  })
  it('accepts explicit structured rhythm and rejects arbitrary markup fields and mismatched text', () => {
    const line = { speaker: '小熊', text: '你好！一起玩。', segments: [{ text: '你好！', emotion: 'excited' }, { pauseMs: 180 }, { text: '一起玩。', emotion: 'warm', rate: '-6%' }] }
    expect(speechLineSchema.safeParse(line).success).toBe(true)
    for (const change of [
      { segments: [{ pauseMs: -1 }] },
      { segments: [{ pauseMs: 1001 }] },
      { segments: [{ text: '另一句话' }] },
      { ssml: '<audio src="https://example.com"/>' },
      { rate: '"/><audio/>' },
      { segmentation: 'sentences' },
    ]) expect(speechLineSchema.safeParse({ ...line, ...change }).success).toBe(false)
  })
})
