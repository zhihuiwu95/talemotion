import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SpeechRequest } from '../runtime/audio/SpeechProvider'
import { PackPlayer } from './PackPlayer'
import { storyPacks } from './library'
import { MIN_BEAT_MS } from './catalog'

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
  audio.speak.mockImplementation((request) => request.onComplete?.())
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
const tap = (name: string) =>
  fireEvent.click(screen.getByRole('button', { name }))
const settle = () => act(() => vi.advanceTimersByTime(MIN_BEAT_MS * 5))
const snow = storyPacks.find((pack) => pack.id === 'snow-mittens')!
const currentNode = (title: string) =>
  screen
    .getByRole('region', { name: `${title}互动故事` })
    .getAttribute('data-node')

describe('shared story player', () => {
  for (const pack of storyPacks)
    for (const path of pack.acceptance)
      it(`${pack.id}: ${path.name}, visible choices reach the specified ending and replay clears history`, () => {
        const onHome = vi.fn()
        render(<PackPlayer pack={pack} onHome={onHome} />)
        expect(audio.speak).not.toHaveBeenCalled()
        tap('走进故事')
        settle()
        for (const id of path.choices) {
          const node = pack.nodes.find((n) => n.id === currentNode(pack.title))!
          const choice = node.interaction!.choices.find((c) => c.id === id)!
          expect(
            screen.getByRole('button', { name: choice.label }),
          ).toBeEnabled()
          tap(choice.label)
          settle()
        }
        expect(currentNode(pack.title)).toBe(path.ending)
        tap('回到首页')
        expect(onHome).toHaveBeenCalledOnce()
        tap('再玩一次')
        settle()
        expect(currentNode(pack.title)).toBe(pack.start)
        tap('家长陪玩')
        expect(screen.getByText(pack.learning.offline)).toBeVisible()
        expect(localStorage.length).toBe(0)
      })
  it('holds feedback until narration ends and rejects rapid and stale pointer taps', () => {
    let done: (() => void) | undefined
    audio.speak.mockImplementation((request) => {
      done = request.onComplete
    })
    render(<PackPlayer pack={snow} onHome={vi.fn()} />)
    tap('走进故事')
    settle()
    tap('问问小熊')
    expect(currentNode(snow.title)).toBe('meet')
    const ask = screen.getByRole('button', { name: '问问小熊' })
    fireEvent.pointerDown(ask)
    act(() => done?.())
    fireEvent.click(ask, { detail: 1 })
    expect(currentNode(snow.title)).toBe('meet')
    fireEvent.click(ask, { detail: 2 })
    expect(currentNode(snow.title)).toBe('meet')
    fireEvent.pointerDown(ask)
    fireEvent.click(ask, { detail: 1 })
    expect(currentNode(snow.title)).toBe('search')
  })
  it('pauses automatic beats, ignores stale audio callbacks and disposes on exit', () => {
    const view = render(<PackPlayer pack={snow} onHome={vi.fn()} />)
    tap('走进故事')
    settle()
    tap('问问小熊')
    settle()
    let done: (() => void) | undefined
    audio.speak.mockImplementation((request) => {
      done = request.onComplete
    })
    tap('看看雪松')
    tap('暂停故事')
    act(() => done?.())
    settle()
    expect(currentNode(snow.title)).toBe('bird')
    expect(screen.getByRole('dialog')).toBeVisible()
    audio.speak.mockImplementation((request) => request.onComplete?.())
    tap('继续故事')
    settle()
    expect(currentNode(snow.title)).toBe('search-clue')
    view.unmount()
    expect(audio.dispose).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('keeps silent playback usable after audio failure without saving observations', () => {
    render(<PackPlayer pack={snow} onHome={vi.fn()} />)
    audio.speak.mockImplementationOnce(() => {
      throw new Error('offline')
    })
    tap('走进故事')
    settle()
    expect(screen.getByRole('status')).toHaveTextContent('声音暂时没有播放')
    tap('关闭声音')
    const count = audio.speak.mock.calls.length
    tap('问问小熊')
    settle()
    tap('拨开积雪')
    settle()
    expect(currentNode(snow.title)).toBe('match')
    expect(audio.speak).toHaveBeenCalledTimes(count)
    expect(localStorage.length).toBe(0)
  })
})
