import { describe, expect, it, vi } from 'vitest'
import { EffectManager, UnknownEffectError } from './EffectManager'
import type { SceneEffect } from './Effect'

function fakeEffect(): SceneEffect {
  return {
    name: 'snow',
    start: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    reset: vi.fn(),
    dispose: vi.fn(),
  }
}

describe('EffectManager', () => {
  it('owns start, stop, pause, reset, and dispose lifecycle', () => {
    const effect = fakeEffect()
    const manager = new EffectManager().register(effect)

    manager.start('snow', { density: 0.6 })
    manager.pause()
    manager.resume()
    manager.stop('snow')
    manager.reset()
    manager.dispose()

    expect(effect.start).toHaveBeenCalledWith({ density: 0.6 })
    expect(effect.pause).toHaveBeenCalledOnce()
    expect(effect.resume).toHaveBeenCalledOnce()
    expect(effect.stop).toHaveBeenCalledOnce()
    expect(effect.reset).toHaveBeenCalledOnce()
    expect(effect.dispose).toHaveBeenCalledOnce()
  })

  it('rejects unregistered effects', () => {
    expect(() => new EffectManager().start('rain')).toThrow(UnknownEffectError)
  })
})

