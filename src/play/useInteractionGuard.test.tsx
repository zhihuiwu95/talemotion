import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  FEEDBACK_MAX_MS,
  FEEDBACK_MIN_MS,
  useInteractionGuard,
} from './useInteractionGuard'

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
function TestScene({ next }: { next: () => void }) {
  const guard = useInteractionGuard()
  return (
    <section {...guard.gestureProps}>
      <button
        onClick={() => {
          if (!guard.isLocked()) guard.hold(FEEDBACK_MIN_MS, true)
        }}
      >
        选择
      </button>
      <button onClick={guard.finishAudio}>音频结束</button>
      <button
        disabled={guard.locked}
        onClick={() => {
          if (!guard.isLocked()) next()
        }}
      >
        继续
      </button>
    </section>
  )
}
const tap = (name: string) =>
  fireEvent.click(screen.getByRole('button', { name }))
describe('cross-screen feedback gate', () => {
  it('needs both the minimum visible feedback and actual audio completion', () => {
    const next = vi.fn()
    render(<TestScene next={next} />)
    tap('选择')
    tap('继续')
    act(() => vi.advanceTimersByTime(FEEDBACK_MIN_MS))
    expect(screen.getByRole('button', { name: '继续' })).toBeDisabled()
    tap('音频结束')
    tap('继续')
    expect(next).toHaveBeenCalledOnce()
    tap('选择')
    tap('音频结束')
    tap('继续')
    expect(next).toHaveBeenCalledOnce()
    act(() => vi.advanceTimersByTime(FEEDBACK_MIN_MS))
    expect(screen.getByRole('button', { name: '继续' })).toBeEnabled()
  })
  it('rejects a pointer gesture begun during feedback even if it ends after unlocking', () => {
    const next = vi.fn()
    render(<TestScene next={next} />)
    tap('选择')
    tap('音频结束')
    const button = screen.getByRole('button', { name: '继续' })
    fireEvent.pointerDown(button)
    act(() => vi.advanceTimersByTime(FEEDBACK_MIN_MS))
    fireEvent.pointerUp(button)
    fireEvent.click(button, { detail: 1 })
    expect(next).not.toHaveBeenCalled()
    fireEvent.pointerDown(button)
    fireEvent.pointerUp(button)
    fireEvent.click(button, { detail: 1 })
    expect(next).toHaveBeenCalledOnce()
    fireEvent.click(button, { detail: 2 })
    expect(next).toHaveBeenCalledOnce()
  })
  it('eventually releases stalled audio and cancels pending callbacks on unmount', () => {
    const view = render(<TestScene next={vi.fn()} />)
    tap('选择')
    act(() => vi.advanceTimersByTime(FEEDBACK_MAX_MS))
    expect(screen.getByRole('button', { name: '继续' })).toBeEnabled()
    tap('选择')
    view.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
