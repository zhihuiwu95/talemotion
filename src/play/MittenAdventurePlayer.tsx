import { useEffect, useRef, useState } from 'react'
import { EdgeAudioProvider } from '../runtime/audio/EdgeAudioProvider'
import { Icon, Mitten, Rabbit } from './Artwork'
import {
  DressedBear,
  Footprints,
  PineBranch,
  Robin,
  Snowman,
  SnowPile,
  WinterWorld,
} from './AdventureArt'
import {
  adventureInitial,
  adventureLine,
  adventureReducer,
  type AdventureAction,
  type AdventureState,
} from './adventureStory'
import { ObservationForm } from './Observation'
import { FEEDBACK_MIN_MS, useInteractionGuard } from './useInteractionGuard'
import './adventure.css'

export function MittenAdventure({
  onHome,
  onClassic,
}: {
  onHome: () => void
  onClassic: () => void
}) {
  const [state, setState] = useState(adventureInitial)
  const current = useRef(state)
  const [muted, setMuted] = useState(false)
  const muteRef = useRef(false)
  const [failed, setFailed] = useState(false)
  const [audio] = useState(() => new EdgeAudioProvider(setFailed))
  const guard = useInteractionGuard()
  const [overlay, setOverlay] = useState<'pause' | 'parent' | null>(null)
  const overlayRef = useRef<typeof overlay>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const [session, setSession] = useState(0)
  const stage = state.stage
  const line = adventureLine(state)
  const warm = [
    'thanks',
    'choose-play',
    'snowman',
    'footprints',
    'ending',
  ].includes(stage)
  const isSnowman =
    stage === 'snowman' || (stage === 'ending' && state.ending === 'snowman')
  const isFootprints =
    stage === 'footprints' ||
    (stage === 'ending' && state.ending === 'footprints')

  function narrate(snapshot: AdventureState) {
    const complete = guard.hold(FEEDBACK_MIN_MS, true, () => {
      if (snapshot !== current.current || overlayRef.current) return
      if (snapshot.stage === 'bird' || snapshot.stage === 'thanks')
        act('settled', true)
    })
    if (muteRef.current || !audio.available) {
      complete()
      return
    }
    try {
      audio.speak({ text: adventureLine(snapshot).text, onComplete: complete })
    } catch {
      setFailed(true)
      complete()
    }
  }
  function act(action: AdventureAction, automatic = false) {
    if (overlayRef.current || (!automatic && guard.isLocked())) return
    const next = adventureReducer(current.current, action)
    if (next === current.current) return
    current.current = next
    setState(next)
    if (action === 'start') setSession((value) => value + 1)
    narrate(next)
  }
  function pause(kind: 'pause' | 'parent') {
    overlayRef.current = kind
    guard.cancel()
    audio.cancel()
    setOverlay(kind)
  }
  function resume() {
    overlayRef.current = null
    setOverlay(null)
    if (current.current.stage !== 'welcome') narrate(current.current)
  }
  // Read the latest pause function without rebuilding browser event subscriptions.
  const pauseRef = useRef(pause)
  useEffect(() => {
    pauseRef.current = pause
  })
  useEffect(() => {
    const hide = () => {
      if (document.hidden && current.current.stage !== 'welcome')
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
    <main
      className={`play-shell adventure-shell ${overlay ? 'is-paused' : ''}`}
    >
      <header className="play-header adventure-header">
        <button className="parent-button" onClick={onHome}>
          ← 故事小屋
        </button>
        <span className="adventure-series">朵朵的雪地冒险</span>
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
              } else if (stage !== 'welcome') narrate(current.current)
            }}
          >
            <Icon name={muted ? 'muted' : 'sound'} />
          </button>
          {stage !== 'welcome' && (
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
        className={`adventure-stage stage-${stage} ${warm ? 'is-warm' : ''} ending-${state.ending ?? 'none'}`}
        data-stage={stage}
        aria-label="雪地里的手套互动动画"
        {...guard.gestureProps}
      >
        <div className="adventure-scenery">
          <WinterWorld />
        </div>
        <div className="falling-snow" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <i
              key={i}
              style={{
                left: `${i * 8.5}%`,
                animationDelay: `${-i * 1.3}s`,
                animationDuration: `${8 + (i % 4)}s`,
              }}
            />
          ))}
        </div>
        <div className="adventure-place">
          {stage === 'welcome' || stage === 'meet'
            ? '森林门口'
            : warm
              ? '暖暖的雪地'
              : '雪松旁边'}
        </div>

        {stage === 'welcome' && (
          <div className="adventure-title">
            <span>一个关于帮助的小故事</span>
            <h1>
              雪地里的
              <br />
              <em>手套</em>
            </h1>
            <p>
              小熊的手好冷呀。
              <br />
              和朵朵一起，找回暖暖的手套。
            </p>
            <button className="big-button" onClick={() => act('start')}>
              走进故事 <Icon name="arrow" />
            </button>
            <small>点画面，一起帮忙 · 随时可以暂停</small>
          </div>
        )}

        <div className="adventure-rabbit">
          <Rabbit happy={warm || stage === 'welcome'} />
        </div>
        <button
          className={`adventure-bear scene-object ${stage === 'meet' && !guard.locked ? 'invites-touch' : ''}`}
          aria-label="问问小熊"
          disabled={stage !== 'meet' || guard.locked}
          onClick={() => act('bear')}
        >
          <DressedBear warm={warm} />
          {stage === 'meet' && !guard.locked && (
            <span className="touch-label">点点我</span>
          )}
        </button>

        {['search', 'bird'].includes(stage) && (
          <>
            <button
              className="scene-object search-pine"
              aria-label="看看雪松"
              disabled={guard.locked || state.birdSeen}
              onClick={() => act('pine')}
            >
              <PineBranch />
            </button>
            <button
              className={`scene-object search-snow ${!guard.locked ? 'invites-touch' : ''}`}
              aria-label="拨开积雪"
              disabled={guard.locked}
              onClick={() => act('snow')}
            >
              <span className="hidden-mitten">
                <Mitten kind="stripe" />
              </span>
              <SnowPile />
            </button>
          </>
        )}
        {state.birdSeen && (
          <div
            className={`adventure-robin ${stage === 'bird' ? 'robin-flies' : ''}`}
          >
            <Robin />
          </div>
        )}

        {stage === 'match' && (
          <div className="uncovered-mittens">
            <div className="snow-reveal" aria-hidden="true">
              <SnowPile />
            </div>
            <button
              className={`scene-object ground-mitten ground-dot ${state.wrong ? 'mitten-wiggle' : ''}`}
              aria-label="蓝色圆点手套"
              disabled={guard.locked}
              onClick={() => act('dot')}
            >
              <Mitten kind="dot" />
            </button>
            <button
              className="scene-object ground-mitten ground-stripe"
              aria-label="红色条纹手套"
              disabled={guard.locked}
              onClick={() => act('stripe')}
            >
              <Mitten kind="stripe" mirror />
            </button>
          </div>
        )}
        {stage === 'thanks' && (
          <>
            <div className="flying-mitten" aria-hidden="true">
              <Mitten kind="stripe" mirror />
            </div>
            <div className="warmth-sparks" aria-hidden="true">
              ✦ <span>暖和啦！</span> ✦
            </div>
          </>
        )}

        {stage === 'choose-play' && (
          <div className="snow-play-options">
            <button
              className="scene-object play-snowman"
              aria-label="一起堆雪人"
              disabled={guard.locked}
              onClick={() => act('snowman')}
            >
              <Snowman />
              <span className="touch-label">堆雪人</span>
            </button>
            <button
              className="scene-object play-footprints"
              aria-label="一起踩脚印"
              disabled={guard.locked}
              onClick={() => act('footprints')}
            >
              <Footprints />
              <span className="touch-label">踩脚印</span>
            </button>
          </div>
        )}
        {isSnowman && (
          <div className={`snowman-scene ${stage === 'ending' ? 'built' : ''}`}>
            <Snowman complete={stage === 'ending'} />
            {stage === 'snowman' && (
              <button
                className={`scene-object little-snowball ${!guard.locked ? 'invites-touch' : ''}`}
                aria-label="滚起小雪球"
                disabled={guard.locked}
                onClick={() => act('build')}
              >
                <span />
              </button>
            )}
          </div>
        )}
        {isFootprints && (
          <button
            className="scene-object footprint-path"
            aria-label="在雪地上走一走"
            disabled={guard.locked || stage === 'ending'}
            onClick={() => act('walk')}
          >
            <Footprints many={stage === 'ending'} />
          </button>
        )}

        {stage !== 'welcome' && (
          <div className="adventure-dialogue" aria-live="polite">
            <div className="dialogue-speaker">
              <span>{line.speaker}</span>
              <button
                className="icon-button"
                aria-label="再听一遍"
                disabled={muted}
                onClick={() => narrate(current.current)}
              >
                <Icon name="repeat" />
              </button>
            </div>
            <p>{line.text}</p>
            <div
              className={`adventure-cue ${guard.locked ? 'is-listening' : ''}`}
            >
              <span aria-hidden="true">{guard.locked ? '♫' : '☞'}</span>
              {guard.locked ? (muted ? '看一看，故事在继续…' : '看一看，听一听…') : line.cue}
            </div>
          </div>
        )}
      </section>

      {stage === 'ending' && (
        <div className="adventure-ending-actions" {...guard.gestureProps}>
          <p>因为你的帮助，小熊又能开心地玩雪了。</p>
          <button
            className="replay-button"
            disabled={guard.locked}
            onClick={() => act('start')}
          >
            <Icon name="repeat" />
            再玩一个结尾
          </button>
          <button className="parent-button" onClick={onHome}>
            回故事小屋
          </button>
          <button className="parent-button" onClick={() => pause('parent')}>
            记录这次试玩
          </button>
        </div>
      )}
      {(failed || !audio.available) && (
        <div className="audio-note" role="status">
          声音暂时没有播放，可以看画面继续玩。
          <button
            className="parent-button"
            onClick={() => {
              muteRef.current = false
              setMuted(false)
              if (stage !== 'welcome') narrate(current.current)
            }}
          >
            重试声音
          </button>
        </div>
      )}
      <footer className="play-footer">
        <span>
          <Icon name="leaf" />
          小小的帮助，暖暖的故事
        </span>
        <span>原创角色 · 无广告</span>
      </footer>

      <dialog
        className="parent-dialog"
        ref={dialog}
        aria-labelledby="adventure-dialog-title"
        onCancel={(event) => {
          event.preventDefault()
          resume()
        }}
      >
        <h2 id="adventure-dialog-title">
          {overlay === 'pause' ? '雪地在这里等你' : '陪孩子，玩进故事里'}
        </h2>
        {overlay === 'pause' ? (
          <>
            <p>准备好了，再回到刚才的故事。</p>
            <button className="big-button" onClick={resume}>
              继续故事
            </button>
            <button className="replay-button" onClick={onHome}>
              今天先到这里
            </button>
          </>
        ) : (
          <>
            <p>
              让孩子自己点点画面。不急着指答案，留意他是否关注小熊的反应、理解自己的帮助，以及想不想再玩。
            </p>
            <p>堆雪人和踩脚印都可以选。雪松里还藏着一位小朋友。</p>
            <p className="parent-small">
              原来的《手套找朋友》仍在故事小屋里。可以另找一个时间玩，比较两种体验，不把时长和尝试次数当作能力评分。
            </p>
            {stage !== 'welcome' && (
              <ObservationForm
                key={session}
                story="雪地里的手套 · 故事版"
                attempts={[state.attempts]}
                completed={warm ? 1 : 0}
              />
            )}
            <button className="big-button" onClick={resume}>
              回到故事
            </button>
            <button className="parent-button" onClick={onClassic}>
              打开原版手套配对
            </button>
          </>
        )}
      </dialog>
    </main>
  )
}
