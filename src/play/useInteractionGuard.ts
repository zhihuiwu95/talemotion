import { useEffect, useRef, useState, type MouseEvent } from 'react'

export const TAP_GAP_MS = 650
export const FEEDBACK_MIN_MS = 1800
export const FEEDBACK_MAX_MS = 20000

/** An immediate gate protects across React renders, not just within one button. */
export function useInteractionGuard() {
  const [locked, setLocked] = useState(false)
  const gate = useRef(false)
  const token = useRef(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const stalePointer = useRef(false)
  const completeAudio = useRef<() => void>(() => {})

  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  function hold(
    minimum = TAP_GAP_MS,
    waitForAudio = false,
    onReady?: () => void,
  ) {
    clearTimers()
    const current = ++token.current
    gate.current = true
    setLocked(true)
    let elapsed = false
    let ended = !waitForAudio
    let released = false
    const release = () => {
      if (token.current !== current || !elapsed || !ended || released) return
      released = true
      clearTimers()
      gate.current = false
      setLocked(false)
      onReady?.()
    }
    const done = () => {
      ended = true
      release()
    }
    completeAudio.current = done
    timers.current.push(
      setTimeout(() => {
        elapsed = true
        release()
      }, minimum),
    )
    if (waitForAudio) timers.current.push(setTimeout(done, FEEDBACK_MAX_MS))
    return done
  }
  function finishAudio() {
    completeAudio.current()
  }
  function cancel() {
    token.current++
    clearTimers()
    gate.current = false
    setLocked(false)
  }
  useEffect(
    () => () => {
      token.current++
      timers.current.forEach(clearTimeout)
    },
    [],
  )

  return {
    locked,
    isLocked: () => gate.current,
    hold,
    finishAudio,
    cancel,
    gestureProps: {
      onPointerDownCapture: () => {
        stalePointer.current = gate.current
      },
      onClickCapture: (event: MouseEvent<HTMLElement>) => {
        if (event.detail > 1 || (event.detail !== 0 && stalePointer.current)) {
          event.preventDefault()
          event.stopPropagation()
        }
        stalePointer.current = false
      },
    },
  }
}
