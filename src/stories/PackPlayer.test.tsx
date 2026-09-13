import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SpeechRequest } from '../runtime/audio/SpeechProvider'
import { PackPlayer } from './PackPlayer'
import { storyPacks } from './library'
import { MIN_BEAT_MS } from './catalog'
import type { StoryPack } from './schema'

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

// Advance one node at a time, bounded by the graph size. An interactive node
// remains visible; this never hides an automatic cycle with runAllTimers().
function settlePath(pack: StoryPack) {
  for (let steps = 0; steps <= pack.nodes.length; steps++) {
    const node = pack.nodes.find(n => n.id === currentNode(pack.title))!
    if (node.kind !== 'ending')
      expect(screen.queryByRole('button', { name: '回到首页' })).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(MIN_BEAT_MS))
    if (node.kind !== 'beat') return
  }
  throw new Error('Automatic path exceeded graph size')
}

describe('shared story player', () => {
  for (const pack of storyPacks)
    for (const path of pack.acceptance)
      it(`${pack.id}: ${path.name}, visible choices reach the specified ending and replay clears history`, () => {
        const onHome = vi.fn()
        render(<PackPlayer pack={pack} onHome={onHome} />)
        expect(audio.speak).not.toHaveBeenCalled()
        tap('走进故事')
        settlePath(pack)
        for (const id of path.choices) {
          const node = pack.nodes.find((n) => n.id === currentNode(pack.title))!
          const choice = node.interaction!.choices.find((c) => c.id === id)!
          expect(
            screen.getByRole('button', { name: choice.label }),
          ).toBeEnabled()
          tap(choice.label)
          settlePath(pack)
        }
        expect(currentNode(pack.title)).toBe(path.ending)
        tap('回到首页')
        expect(onHome).toHaveBeenCalledOnce()
        tap('再玩一次')
        expect(currentNode(pack.title)).toBe(pack.start)
        settlePath(pack)
        let first = pack.nodes.find(n => n.id === pack.start)!
        for (let i = 0; first.kind === 'beat' && i < pack.nodes.length; i++)
          first = pack.nodes.find(n => n.id === first.next)!
        expect(currentNode(pack.title)).toBe(first.id)
        tap('家长陪玩')
        expect(screen.getByText(pack.learning.offline)).toBeVisible()
        expect(localStorage.length).toBe(0)
      })
  it('holds and restarts an automatic opening across pause while ignoring its old audio callback', () => {
    const party = storyPacks.find(p => p.id === 'garden-gathering-party')!
    const callbacks: (() => void)[] = []
    audio.speak.mockImplementation(request => { if (request.onComplete) callbacks.push(request.onComplete) })
    render(<PackPlayer pack={party} onHome={() => {}} />)
    expect(audio.speak).not.toHaveBeenCalled()
    tap('走进故事')
    settle()
    expect(currentNode(party.title)).toBe('s01')
    tap('暂停故事')
    act(() => callbacks[0]!())
    settle()
    expect(currentNode(party.title)).toBe('s01')
    tap('继续故事')
    act(() => callbacks[0]!())
    settle()
    expect(currentNode(party.title)).toBe('s01')
    act(() => callbacks[1]!())
    expect(currentNode(party.title)).toBe('s02')
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
