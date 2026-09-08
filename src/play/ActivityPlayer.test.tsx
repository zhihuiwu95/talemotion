import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { activities, advance, newActivityState, itemNames } from './activities'
import { ActivityPlayer } from './ActivityPlayer'
import { readObservations, storageKey } from './observations'
import { ObservationHistory } from './Observation'

vi.mock('../runtime/audio/EdgeAudioProvider', () => ({
  EdgeAudioProvider: class {
    available = true
    speak = vi.fn()
    cancel = vi.fn()
    dispose = vi.fn()
  },
}))
beforeEach(() => {
  localStorage.clear()
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
})
const click = (name: string) =>
  fireEvent.click(screen.getByRole('button', { name }))
describe('new activities', () => {
  for (const activity of activities)
    it(`finishes ${activity.title} with retries, saves only explicit observations and resets replay`, () => {
      render(<ActivityPlayer activity={activity} onHome={vi.fn()} />)
      click('一起出发')
      activity.rounds.forEach((round, index) => {
        click(itemNames[round.choices.find((item) => item !== round.target)!]!)
        expect(screen.getByText(round.hint)).toBeVisible()
        click(itemNames[round.target]!)
        expect(
          screen.getByRole('heading', { name: '你帮上忙啦！' }),
        ).toBeVisible()
        click(index === 2 ? '准备好啦' : '接着帮忙')
      })
      expect(
        screen.getByRole('heading', { name: '谢谢你，小帮手！' }),
      ).toBeVisible()
      expect(readObservations()).toEqual([])
      click('记录这次试玩')
      fireEvent.change(screen.getByLabelText('孩子理解了玩法吗？'), {
        target: { value: '大人提示或示范后完成' },
      })
      fireEvent.change(screen.getByLabelText('孩子想再玩吗？'), {
        target: { value: '主动要求再玩' },
      })
      fireEvent.change(screen.getByLabelText('你愿意下次继续陪玩吗？'), {
        target: { value: '愿意再试一次' },
      })
      click('保存这次观察')
      click('保存这次观察')
      expect(readObservations()).toHaveLength(1)
      expect(readObservations()[0]).toMatchObject({
        story: activity.title,
        completed: 3,
        attempts: [2, 2, 2],
        replay: '主动要求再玩',
      })
      click('知道啦')
      click('再玩一次')
      expect(
        screen.getByRole('heading', { name: activity.rounds[0].prompt }),
      ).toBeVisible()
      expect(readObservations()).toHaveLength(1)
    })
  it('preserves a successful round when stopping early, and guards rapid or invalid actions', () => {
    const activity = activities[0]!
    let state = newActivityState(activity)
    expect(advance(activity, state, { type: 'next' })).toBe(state)
    state = advance(activity, state, { type: 'start' })
    expect(advance(activity, state, { type: 'choose', item: 'invalid' })).toBe(
      state,
    )
    state = advance(activity, state, {
      type: 'choose',
      item: activity.rounds[0].target,
    })
    expect(
      advance(activity, state, {
        type: 'choose',
        item: activity.rounds[0].target,
      }),
    ).toBe(state)
    expect(advance(activity, state, { type: 'close' }).completed).toBe(1)
    render(<ActivityPlayer activity={activity} onHome={vi.fn()} />)
    click('一起出发')
    click('大碗')
    click('暂停故事')
    click('继续故事')
    expect(screen.getByRole('heading', { name: '你帮上忙啦！' })).toBeVisible()
    click('暂停故事')
    click('今天先到这里')
    click('记录这次试玩')
    expect(screen.getByText(/完成 1 轮；各轮尝试：1 \/ 0 \/ 0/)).toBeVisible()
  })
  it('handles corrupted storage and clears only after confirmation', () => {
    localStorage.setItem(storageKey, '{broken')
    expect(readObservations()).toEqual([])
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        {
          id: 'test',
          date: new Date().toISOString(),
          story: '测试记录',
          attempts: [1],
          completed: 1,
        },
      ]),
    )
    render(<ObservationHistory />)
    fireEvent.click(screen.getByText('家长的试玩记录'))
    click('清除本机记录')
    expect(readObservations()).toHaveLength(1)
    click('保留记录')
    expect(readObservations()).toHaveLength(1)
    click('清除本机记录')
    click('确认清除')
    expect(readObservations()).toEqual([])
  })
})
