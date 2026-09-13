import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SpeechRequest } from '../runtime/audio/SpeechProvider'
import { MittenAdventure } from './MittenAdventurePlayer'
import { FEEDBACK_MIN_MS } from './useInteractionGuard'

const audio = vi.hoisted(() => ({
  speak: vi.fn((request: SpeechRequest) => request.onComplete?.()),
  cancel: vi.fn(),
  dispose: vi.fn(),
}))
vi.mock('../runtime/audio/EdgeAudioProvider', () => ({
  EdgeAudioProvider: class {
    available = true
    speak = audio.speak
    cancel = audio.cancel
    dispose = audio.dispose
  },
}))
beforeEach(() => {
  vi.useFakeTimers()
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
  vi.useRealTimers()
})
const rawTap = (name: string) =>
  fireEvent.click(screen.getByRole('button', { name }))
const settle = () => act(() => vi.advanceTimersByTime(FEEDBACK_MIN_MS * 2))
const tap = (name: string) => {
  rawTap(name)
  settle()
}
const stage = () =>
  screen
    .getByRole('region', { name: '雪地里的手套互动动画' })
    .getAttribute('data-stage')

describe('short mitten adventure', () => {
  for (const ending of ['snowman', 'footprints'] as const)
    it(`explores, retries, thanks the child and reaches the ${ending} ending with a clean replay`, () => {
      const onHome = vi.fn()
      render(<MittenAdventure onHome={onHome} onClassic={vi.fn()} />)
      expect(audio.speak).not.toHaveBeenCalled()
      tap('走进故事')
      tap('问问小熊')
      tap('看看雪松')
      expect(stage()).toBe('search')
      expect(screen.getByText(/雪里露出了小小的一角/)).toBeVisible()
      tap('拨开积雪')
      tap('蓝色圆点手套')
      expect(stage()).toBe('match')
      expect(screen.getByText(/这只是蓝色圆点的/)).toBeVisible()
      rawTap('红色条纹手套')
      expect(stage()).toBe('thanks')
      expect(screen.getByText(/我的手暖和啦/)).toBeVisible()
      expect(
        screen.queryByRole('button', { name: '一起堆雪人' }),
      ).not.toBeInTheDocument()
      settle()
      expect(stage()).toBe('choose-play')
      tap(ending === 'snowman' ? '一起堆雪人' : '一起踩脚印')
      tap(ending === 'snowman' ? '滚起小雪球' : '在雪地上走一走')
      expect(stage()).toBe('ending')
      expect(
        screen.getByText(
          ending === 'snowman'
            ? /我们的小雪人会笑啦/
            : /一串大脚印，一串小脚印/,
        ),
      ).toBeVisible()
      tap('回到首页')
      expect(onHome).toHaveBeenCalledOnce()
      tap('再玩一个结尾')
      expect(stage()).toBe('meet')
      tap('问问小熊')
      expect(screen.getByRole('button', { name: '看看雪松' })).toBeEnabled()
    })
  it('cannot skip dialogue by tapping rapidly and continues in silence or after audio failure', () => {
    render(<MittenAdventure onHome={vi.fn()} onClassic={vi.fn()} />)
    audio.speak.mockImplementationOnce(() => {
      throw new Error('unavailable')
    })
    rawTap('走进故事')
    rawTap('问问小熊')
    expect(stage()).toBe('meet')
    expect(screen.getByRole('status')).toHaveTextContent('声音暂时没有播放')
    settle()
    tap('关闭声音')
    const count = audio.speak.mock.calls.length
    tap('问问小熊')
    tap('拨开积雪')
    tap('红色条纹手套')
    expect(stage()).toBe('choose-play')
    expect(audio.speak).toHaveBeenCalledTimes(count)
  })
  it('freezes automatic transitions during pause and clears all audio and timers on exit', () => {
    const view = render(
      <MittenAdventure onHome={vi.fn()} onClassic={vi.fn()} />,
    )
    tap('走进故事')
    tap('问问小熊')
    tap('拨开积雪')
    rawTap('红色条纹手套')
    rawTap('暂停故事')
    settle()
    expect(stage()).toBe('thanks')
    expect(screen.getByRole('dialog')).toBeVisible()
    tap('继续故事')
    expect(stage()).toBe('choose-play')
    view.unmount()
    expect(audio.dispose).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })
})
