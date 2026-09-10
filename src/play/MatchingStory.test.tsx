import type { SpeechRequest } from '../runtime/audio/SpeechProvider'
import { FEEDBACK_MIN_MS } from './useInteractionGuard'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MatchingStory } from './MatchingStory'
import { initialState, storyReducer } from './story'

const audio = vi.hoisted(() => ({
  available: true,
  speak: vi.fn((request: SpeechRequest) => request.onComplete?.()),
  cancel: vi.fn(),
  dispose: vi.fn(),
}))
vi.mock('../runtime/audio/EdgeAudioProvider', () => ({
  EdgeAudioProvider: class {
    available = audio.available
    speak = audio.speak
    cancel = audio.cancel
    dispose = audio.dispose
  },
}))

beforeEach(() => {
  vi.useFakeTimers()
  audio.available = true
  vi.clearAllMocks()
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute('open', '')
    },
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute('open')
    },
  })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
})
const click = (name: string) => {
  fireEvent.click(screen.getByRole('button', { name }))
  act(() => vi.advanceTimersByTime(FEEDBACK_MIN_MS))
}

describe('matching story', () => {
  it('keeps the result visible across repeated taps and waits for the praise to finish', () => {
    render(<MatchingStory />)
    click('一起出发')
    audio.speak.mockImplementationOnce(() => {})
    fireEvent.click(screen.getByRole('button', { name: '红色条纹手套' }))
    const next = screen.getByRole('button', { name: '送给小熊' })
    fireEvent.click(next)
    act(() => vi.advanceTimersByTime(FEEDBACK_MIN_MS))
    expect(next).toBeDisabled()
    expect(screen.getByText('帮小熊找手套')).toBeVisible()
    const callback = audio.speak.mock.calls.at(-1)?.[0].onComplete
    act(() => callback?.())
    expect(next).toBeEnabled()
    fireEvent.click(next)
    expect(screen.getByText('帮小狐狸找手套')).toBeVisible()
  })
  it('lets a child retry, finish all three deliveries, leave for offline play, and replay cleanly', () => {
    render(<MatchingStory />)
    expect(audio.speak).not.toHaveBeenCalled()
    click('一起出发')
    click('蓝色圆点手套')
    expect(screen.getByText('不一样，再找找')).toBeVisible()
    expect(screen.getByText('再看看，红红的，还有一道道条纹。')).toBeVisible()
    expect(
      screen.queryByRole('button', { name: '送给小熊' }),
    ).not.toBeInTheDocument()
    click('红色条纹手套')
    expect(
      screen.getByRole('heading', { name: '一样的，找到啦！' }),
    ).toBeVisible()
    expect(
      screen.queryByRole('button', { name: '红色条纹手套' }),
    ).not.toBeInTheDocument()
    click('送给小熊')
    click('蓝色圆点手套')
    click('送给小狐狸')
    click('黄色星星手套')
    click('送给小猫')
    expect(
      screen.getByRole('heading', { name: '谢谢你，小帮手！' }),
    ).toBeVisible()
    click('家长陪玩')
    expect(
      screen.getByText('已找到 3 对；各轮尝试次数：2 / 1 / 1。'),
    ).toBeVisible()
    click('知道啦')
    click('去和爸爸妈妈玩')
    expect(screen.getByRole('heading', { name: '下次再一起玩' })).toBeVisible()
    click('再玩一次')
    expect(screen.getByText('帮小熊找手套')).toBeVisible()
    click('家长陪玩')
    expect(
      screen.getByText('已找到 0 对；各轮尝试次数：0 / 0 / 0。'),
    ).toBeVisible()
  })

  it('preserves a choice and progress across pause, supports silent play, and cancels audio on unmount', () => {
    const view = render(<MatchingStory />)
    click('一起出发')
    click('蓝色圆点手套')
    click('暂停故事')
    expect(screen.getByRole('dialog')).toBeVisible()
    click('继续故事')
    expect(screen.getByText('不一样，再找找')).toBeVisible()
    click('关闭声音')
    const calls = audio.speak.mock.calls.length
    click('红色条纹手套')
    expect(audio.speak).toHaveBeenCalledTimes(calls)
    click('暂停故事')
    click('今天先到这里')
    click('家长陪玩')
    expect(
      screen.getByText('已找到 1 对；各轮尝试次数：2 / 0 / 0。'),
    ).toBeVisible()
    view.unmount()
    expect(audio.dispose).toHaveBeenCalledOnce()
  })

  it('works with no speech provider and no sound-dependent progression', () => {
    audio.available = false
    render(<MatchingStory />)
    expect(screen.getByRole('status')).toHaveTextContent('当前旁白暂不可用')
    click('一起出发')
    click('红色条纹手套')
    click('送给小熊')
    expect(screen.getByText('帮小狐狸找手套')).toBeVisible()
  })

  it('ignores out-of-phase and repeated events so rapid taps cannot skip tasks or count a match twice', () => {
    expect(storyReducer(initialState, { type: 'next' })).toBe(initialState)
    let state = storyReducer(initialState, { type: 'start' })
    expect(storyReducer(state, { type: 'choose', kind: 'star' })).toBe(state)
    state = storyReducer(state, { type: 'choose', kind: 'stripe' })
    expect(storyReducer(state, { type: 'choose', kind: 'stripe' })).toBe(state)
    state = storyReducer(state, { type: 'next' })
    expect(storyReducer(state, { type: 'next' })).toBe(state)
    expect(state.round).toBe(1)
    expect(state.found).toBe(1)
  })
})
