import { describe, expect, it } from 'vitest'
import winterCottageInput from '../demo/winter-cottage.scene.json'
import { parseScene, SceneSchema } from './scene'

describe('SceneSchema', () => {
  it('validates the winter cottage golden scene', () => {
    const scene = parseScene(winterCottageInput)

    expect(scene.sceneId).toBe('winter-cottage-01')
    expect(scene.title).toBe('松林深处的灯光')
    expect(scene.duration).toBe(120)
    expect(scene.timeline.length).toBeGreaterThan(30)
    expect(scene.captions).toHaveLength(16)
    expect(scene.timeline[0]).toMatchObject({
      type: 'audio.play',
      lang: 'zh-CN',
    })
  })

  it('rejects actions outside the allowlist', () => {
    const invalidScene = {
      ...winterCottageInput,
      timeline: [{ at: 0, type: 'eval', code: 'window.alert(1)' }],
    }

    const result = SceneSchema.safeParse(invalidScene)

    expect(result.success).toBe(false)
  })

  it('rejects unknown targets before the runtime starts', () => {
    const invalidScene = structuredClone(winterCottageInput)
    invalidScene.timeline[2]!.target = 'missing-rabbit'

    const result = SceneSchema.safeParse(invalidScene)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes('unknown target'))).toBe(true)
    }
  })

  it('rejects actions that run past the declared duration', () => {
    const invalidScene = structuredClone(winterCottageInput)
    invalidScene.timeline[2]!.at = 115

    const result = SceneSchema.safeParse(invalidScene)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes('exceeds'))).toBe(true)
    }
  })
})
