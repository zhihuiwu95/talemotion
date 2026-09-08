import { useEffect, useRef, useState } from 'react'
import { EdgeAudioProvider } from '../runtime/audio/EdgeAudioProvider'
import { ActivityArt } from './ActivityArt'
import { Forest, Friend, Icon, Rabbit } from './Artwork'
import {
  advance,
  activityNarration,
  itemNames,
  newActivityState,
  type Activity,
  type ActivityEvent,
} from './activities'
import { ObservationForm } from './Observation'

export function ActivityPlayer({
  activity,
  onHome,
}: {
  activity: Activity
  onHome: () => void
}) {
  const [state, setState] = useState(() => newActivityState(activity))
  const [muted, setMuted] = useState(false)
  const [failed, setFailed] = useState(false)
  const [overlay, setOverlay] = useState<'parent' | 'pause' | null>(null)
  const [audio] = useState(() => new EdgeAudioProvider(setFailed))
  const [session, setSession] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const stateRef = useRef(state)
  const round = activity.rounds[state.round] ?? activity.rounds[0]
  const message = activityNarration(activity, state)
  const active = state.phase === 'playing' || state.phase === 'success'
  const completed = state.completed
  function speak(text: string, force = false) {
    if (!muted || force) audio.speak({ text })
  }
  function act(event: ActivityEvent) {
    const previous = stateRef.current
    const next = advance(activity, previous, event)
    if (previous === next) return
    stateRef.current = next
    setState(next)
    if (event.type === 'start') setSession((value) => value + 1)
    speak(
      event.type === 'start' && previous.phase === 'welcome'
        ? activity.intro + activity.rounds[0].prompt
        : activityNarration(activity, next),
    )
  }
  function open(kind: 'parent' | 'pause') {
    audio.cancel()
    setOverlay(kind)
  }
  function close() {
    setOverlay(null)
    if (state.phase !== 'welcome') speak(message)
  }
  useEffect(() => () => audio.dispose(), [audio])
  useEffect(() => {
    if (overlay) dialog.current?.showModal()
    else dialog.current?.close()
  }, [overlay])
  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [state.phase, state.round])
  useEffect(() => {
    const hide = () => {
      if (document.hidden) {
        audio.cancel()
        if (active) setOverlay('pause')
      }
    }
    document.addEventListener('visibilitychange', hide)
    return () => document.removeEventListener('visibilitychange', hide)
  }, [active, audio])
  return (
    <main className="play-shell">
      <header className="play-header">
        <button className="parent-button" onClick={onHome}>
          ← 故事小屋
        </button>
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label={muted ? '打开声音' : '关闭声音'}
            aria-pressed={muted}
            onClick={() => {
              if (!muted) audio.cancel()
              else speak(message, true)
              setMuted(!muted)
            }}
          >
            <Icon name={muted ? 'muted' : 'sound'} />
          </button>
          {active && (
            <button
              className="icon-button"
              aria-label="暂停故事"
              onClick={() => open('pause')}
            >
              <Icon name="pause" />
            </button>
          )}
          <button className="parent-button" onClick={() => open('parent')}>
            家长陪玩
          </button>
        </div>
      </header>
      <section
        className={`storybook activity-book phase-${state.phase}`}
        aria-label={`${activity.title}互动故事`}
      >
        <div className="story-world">
          <Forest />
          <div className="world-label">✦ 兔子警官的森林日常</div>
          <div className="rabbit-position">
            <Rabbit
              happy={state.phase === 'success' || state.phase === 'finished'}
            />
          </div>
          <div className="friend-position">
            <Friend
              animal={activity.id === 'hide' ? 'cat' : 'bear'}
              happy={state.phase === 'success'}
            />
          </div>
          <div className="rabbit-name">
            <i>✦</i>朵朵警官
          </div>
          <div className="world-caption">
            {state.phase === 'success' ? round.success : activity.title}
          </div>
        </div>
        <div className="story-panel">
          {state.phase === 'welcome' ? (
            <div className="activity-welcome">
              <div className="episode-label">
                亲子互动故事 · {activity.skill}
              </div>
              <h1 ref={heading} tabIndex={-1}>
                {activity.title}
              </h1>
              <p>{activity.intro}</p>
              <div className="activity-cover">
                <ActivityArt item={activity.cover} />
              </div>
              <button
                className="big-button"
                onClick={() => act({ type: 'start' })}
              >
                一起出发 <Icon name="arrow" />
              </button>
              <p className="session-note">{activity.age} · 约 2–4 分钟</p>
            </div>
          ) : active ? (
            <div className="mission-panel activity-mission">
              <div className="mission-topline">
                <span>{activity.title}</span>
                <span>
                  {state.round + 1} / {activity.rounds.length}
                </span>
              </div>
              <h1 ref={heading} tabIndex={-1}>
                {state.phase === 'success' ? '你帮上忙啦！' : round.prompt}
              </h1>
              {activity.id === 'garden' && (
                <div className="sequence-strip" aria-label="浇花的步骤">
                  {['拿水壶', '装好水', '给花浇水'].map((step, index) => (
                    <span
                      key={step}
                      className={index < completed ? 'done' : ''}
                    >
                      {index < completed ? '✓ ' : ''}
                      {step}
                    </span>
                  ))}
                </div>
              )}
              <div
                className={`spoken-line ${state.wrong ? 'is-hint' : ''}`}
                aria-live="polite"
              >
                <p>
                  {state.phase === 'success'
                    ? round.success
                    : state.wrong
                      ? round.hint
                      : '听一听，再点一点图片。'}
                </p>
                <button
                  className="icon-button"
                  disabled={muted}
                  aria-label="再听一遍"
                  onClick={() => speak(message)}
                >
                  <Icon name="sound" />
                </button>
              </div>
              {state.phase === 'playing' ? (
                <div
                  className="choices activity-choices"
                  role="group"
                  aria-label="选择图片"
                >
                  {(session % 2 === 0
                    ? [...round.choices].reverse()
                    : round.choices
                  ).map((item) => (
                    <button
                      className={`choice ${state.wrong === item ? 'was-tried' : ''}`}
                      key={item}
                      aria-label={itemNames[item]}
                      onClick={() => act({ type: 'choose', item })}
                    >
                      <ActivityArt item={item} />
                      <span>{state.wrong === item ? '再看看' : '点一点'}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="activity-result">
                  <ActivityArt item={round.target} />
                  <button
                    className="big-button"
                    onClick={() => act({ type: 'next' })}
                  >
                    {state.round === activity.rounds.length - 1
                      ? '准备好啦'
                      : '接着帮忙'}
                    <Icon name="arrow" />
                  </button>
                </div>
              )}
              <div
                className="friend-progress"
                aria-label={`完成 ${completed} 轮`}
              >
                {activity.rounds.map((_, i) => (
                  <span key={i} className={i < completed ? 'done' : ''}>
                    {i < completed ? '✓' : '○'} 小发现
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="ending-panel">
              <div className="episode-label">森林服务站 · 休息一下</div>
              <h1 ref={heading} tabIndex={-1}>
                {state.phase === 'finished'
                  ? '谢谢你，小帮手！'
                  : '下次再一起玩'}
              </h1>
              <div className="offline-card">
                <span>把故事带回生活</span>
                <h2>{activity.title}</h2>
                <p>{activity.offline}</p>
              </div>
              {state.phase === 'finished' && (
                <button
                  className="big-button"
                  onClick={() => act({ type: 'close' })}
                >
                  去和爸爸妈妈玩 <Icon name="arrow" />
                </button>
              )}
              <button
                className="replay-button"
                onClick={() => act({ type: 'start' })}
              >
                <Icon name="repeat" />
                再玩一次
              </button>
              <button className="parent-button" onClick={onHome}>
                回故事小屋
              </button>
              <button className="parent-button" onClick={() => open('parent')}>
                记录这次试玩
              </button>
            </div>
          )}
          {(failed || !audio.available) && (
            <div className="audio-note" role="status">
              声音没有播放。可以重试，也可以请大人读提示。
              <button
                className="parent-button"
                onClick={() => {
                  setMuted(false)
                  speak(message, true)
                }}
              >
                重试声音
              </button>
            </div>
          )}
        </div>
      </section>
      <footer className="play-footer">
        <span>
          <Icon name="leaf" />
          慢慢观察，小小发现
        </span>
        <span>没有倒计时，按孩子的节奏来</span>
      </footer>
      <dialog
        className="parent-dialog"
        ref={dialog}
        aria-labelledby="activity-dialog-title"
        onCancel={(event) => {
          event.preventDefault()
          close()
        }}
      >
        <h2 id="activity-dialog-title">
          {overlay === 'pause' ? '歇一小会儿' : '一起玩，观察孩子的反应'}
        </h2>
        {overlay === 'pause' ? (
          <>
            <p>故事还在这里，准备好了再继续。</p>
            <button className="big-button" onClick={close}>
              继续故事
            </button>
            <button
              className="replay-button"
              onClick={() => {
                setOverlay(null)
                act({ type: 'close' })
              }}
            >
              今天先到这里
            </button>
          </>
        ) : (
          <>
            <p>{activity.parent}</p>
            <p>可以用手指，也可以说出来。不愿继续就结束，下次再试。</p>
            <div className="parent-observation">
              完成 {completed} 轮；各轮尝试：{state.attempts.join(' / ')}
              。次数不是能力评分。
            </div>
            {state.phase !== 'welcome' && (
              <ObservationForm
                key={session}
                story={activity.title}
                attempts={state.attempts}
                completed={completed}
              />
            )}
            <p className="parent-small">
              原创角色 · 无广告 · 不采集录音
              <br />
              旁白为预先生成的中文音频。
            </p>
            <button className="big-button" onClick={close}>
              知道啦
            </button>
          </>
        )}
      </dialog>
    </main>
  )
}
