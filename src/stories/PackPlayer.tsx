import { useEffect, useRef, useState } from 'react'
import { narrationClipId } from '../runtime/audio/narrationLookup'
import { EdgeAudioProvider } from '../runtime/audio/EdgeAudioProvider'
import { Icon } from '../play/Artwork'
import { ObservationForm } from '../play/Observation'
import { useInteractionGuard } from '../play/useInteractionGuard'
import { MIN_BEAT_MS } from './catalog'
import { initialStoryState, transition, type StoryState } from './engine'
import type { StoryPack } from './schema'
import { StoryArt, StoryBackdrop } from './StoryArt'
import './stories.css'

export function PackPlayer({
  pack,
  onHome,
}: {
  pack: StoryPack
  onHome: () => void
}) {
  const [state, setState] = useState(() => initialStoryState(pack))
  const current = useRef(state)
  const [started, setStarted] = useState(false)
  const startedRef = useRef(false)
  const [muted, setMuted] = useState(false)
  const muteRef = useRef(false)
  const [failed, setFailed] = useState(false)
  const [audio] = useState(() => new EdgeAudioProvider(setFailed))
  const [overlay, setOverlay] = useState<'pause' | 'parent' | null>(null)
  const overlayRef = useRef(overlay)
  const [session, setSession] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const guard = useInteractionGuard()
  const node = pack.nodes.find((item) => item.id === state.nodeId)!

  function narrate(snapshot: StoryState) {
    audio.cancel()
    const scene = pack.nodes.find((item) => item.id === snapshot.nodeId)!
    const done = guard.hold(MIN_BEAT_MS, true, () => {
      if (current.current !== snapshot || overlayRef.current) return
      if (scene.kind === 'beat') advance({ type: 'settled' })
    })
    if (muteRef.current || !audio.available) {
      done()
      return
    }
    try {
      audio.speak({ id: narrationClipId(`pack:${pack.id}:${scene.id}`), text: scene.line.text, onComplete: done })
    } catch {
      setFailed(true)
      done()
    }
  }
  function advance(action: Parameters<typeof transition>[2]) {
    if (overlayRef.current || !startedRef.current || guard.isLocked()) return
    const next = transition(pack, current.current, action)
    if (next === current.current) return
    current.current = next
    setState(next)
    narrate(next)
  }
  function start() {
    if (overlayRef.current || guard.isLocked()) return
    const next = initialStoryState(pack)
    current.current = next
    startedRef.current = true
    setStarted(true)
    setState(next)
    setSession((value) => value + 1)
    narrate(next)
  }
  function pause(kind: 'pause' | 'parent') {
    overlayRef.current = kind
    setOverlay(kind)
    guard.cancel()
    audio.cancel()
  }
  function resume() {
    overlayRef.current = null
    setOverlay(null)
    if (startedRef.current) narrate(current.current)
  }
  function home() {
    audio.cancel()
    guard.cancel()
    onHome()
  }
  const pauseRef = useRef(pause)
  useEffect(() => {
    pauseRef.current = pause
  })
  useEffect(() => {
    const hide = () => {
      if (document.hidden && startedRef.current && !overlayRef.current)
        pauseRef.current('pause')
    }
    document.addEventListener('visibilitychange', hide)
    return () => {
      document.removeEventListener('visibilitychange', hide)
      audio.dispose()
    }
  }, [audio])
  useEffect(() => {
    if (overlay) dialog.current?.showModal()
    else dialog.current?.close()
  }, [overlay])

  return (
    <main className={`play-shell pack-shell ${overlay ? 'is-paused' : ''}`}>
      <header className="play-header pack-header">
        <button className="parent-button" onClick={home}>
          ← 故事小屋
        </button>
        <span className="pack-series">朵朵和朋友们</span>
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label={muted ? '打开声音' : '关闭声音'}
            aria-pressed={muted}
            onClick={() => {
              muteRef.current = !muteRef.current
              setMuted(muteRef.current)
              if (muteRef.current) {
                audio.cancel()
                guard.finishAudio()
              } else if (startedRef.current && !overlayRef.current)
                narrate(current.current)
            }}
          >
            <Icon name={muted ? 'muted' : 'sound'} />
          </button>
          {started && (
            <button
              className="icon-button"
              aria-label="暂停故事"
              onClick={() => pause('pause')}
            >
              <Icon name="pause" />
            </button>
          )}
          <button className="parent-button" onClick={() => pause('parent')}>
            家长陪玩
          </button>
        </div>
      </header>
      <section
        className={`pack-book world-${node.backdrop}`}
        aria-label={`${pack.title}互动故事`}
        data-node={started ? node.id : 'welcome'}
        {...guard.gestureProps}
      >
        <div className="pack-caption">
          <span>森林日常</span>
          <h1>{pack.title}</h1>
          <span className="pack-age">
            {pack.audience.minAge}–{pack.audience.maxAge} 岁 · 亲子共玩
          </span>
        </div>
        <div className="pack-stage" aria-label="故事画面">
          <StoryBackdrop kind={node.backdrop} />
          <div className="pack-ensemble" key={`${session}-${state.visits}`}>
            {node.entities.map((entity) => {
              const choice = started
                ? node.interaction?.choices.find(
                    (item) => item.target === entity.id,
                  )
                : undefined
              const content = (
                <>
                  <span
                    className={`pack-sprite motion-${started ? entity.motion : 'still'}`}
                  >
                    <StoryArt entity={entity} />
                  </span>
                  {choice && (
                    <span className="pack-touch-label">{choice.label}</span>
                  )}
                </>
              )
              const className = `pack-object slot-${entity.slot} asset-${entity.asset} ${choice ? 'is-touchable' : ''}`
              return choice ? (
                <button
                  className={className}
                  key={entity.id}
                  aria-label={choice.label}
                  disabled={guard.locked || !!overlay}
                  onClick={() => advance({ type: 'choose', id: choice.id })}
                >
                  {content}
                </button>
              ) : (
                <div className={className} key={entity.id} aria-hidden="true">
                  {content}
                </div>
              )
            })}
          </div>
        </div>
        {!started ? (
          <div className="pack-welcome">
            <p>{pack.summary}</p>
            <button className="big-button" onClick={start}>
              走进故事 <Icon name="arrow" />
            </button>
            <small>点点画面，按自己的节奏来</small>
          </div>
        ) : (
          <div className="pack-dialogue" aria-live="polite">
            <div className="pack-speaker">
              <strong>{node.line.speaker}</strong>
              <button
                className="icon-button"
                aria-label="再听一遍"
                disabled={muted || !!overlay}
                onClick={() => narrate(current.current)}
              >
                <Icon name="repeat" />
              </button>
            </div>
            <p>{node.line.text}</p>
            <div className="pack-cue">
              {guard.locked
                ? muted
                  ? '看一看，故事在继续…'
                  : '看一看，听一听…'
                : node.cue}
            </div>
          </div>
        )}
        {started && node.kind === 'ending' && (
          <div className="pack-ending">
            <button
              className="replay-button"
              disabled={guard.locked}
              onClick={start}
            >
              再玩一次
            </button>
            <button className="parent-button" onClick={home}>
              回故事小屋
            </button>
            <button className="parent-button" onClick={() => pause('parent')}>
              记一小笔
            </button>
          </div>
        )}
      </section>
      {failed && (
        <p className="audio-note" role="status">
          声音暂时没有播放，可以看画面继续玩。
          <button
            className="parent-button"
            onClick={() => {
              muteRef.current = false
              setMuted(false)
              if (startedRef.current && !overlayRef.current)
                narrate(current.current)
            }}
          >
            重试声音
          </button>
        </p>
      )}
      <footer className="play-footer">
        <span>
          <Icon name="leaf" /> 一次一个故事，慢慢来
        </span>
        <span>原创故事 · 无广告</span>
      </footer>
      <dialog
        ref={dialog}
        className="parent-dialog"
        aria-labelledby="pack-dialog-title"
        onCancel={(event) => {
          event.preventDefault()
          resume()
        }}
      >
        <h2 id="pack-dialog-title">
          {overlay === 'pause' ? '朋友们在这里等你' : '陪孩子，玩进故事里'}
        </h2>
        {overlay === 'parent' ? (
          <>
            <p>{pack.audience.support}</p>
            <h3>留意这一刻</h3>
            <p>{pack.learning.observation}</p>
            <h3>把故事带回生活</h3>
            <p>{pack.learning.offline}</p>
            <p className="parent-small">{pack.learning.limitation}</p>
            {started && (
              <ObservationForm
                key={session}
                mode="story"
                story={`${pack.title} · 故事包 v${pack.schemaVersion}`}
                attempts={[state.choices.length]}
                completed={node.kind === 'ending' ? 1 : 0}
              />
            )}
          </>
        ) : (
          <p>准备好了，再回到刚才的画面。</p>
        )}
        <button className="big-button" onClick={resume}>
          {overlay === 'pause' ? '继续故事' : '回到故事'}
        </button>
        <button className="replay-button" onClick={home}>
          今天先到这里
        </button>
      </dialog>
    </main>
  )
}
