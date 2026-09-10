import { FEEDBACK_MIN_MS, useInteractionGuard } from './useInteractionGuard'
import { useEffect, useReducer, useRef, useState } from 'react'
import { EdgeAudioProvider } from '../runtime/audio/EdgeAudioProvider'
import { ObservationForm } from './Observation'
import { Forest, Friend, Icon, Mitten, Rabbit } from './Artwork'
import {
  initialState,
  mittens,
  narration,
  rounds,
  storyReducer,
  type StoryEvent,
} from './story'

export function MatchingStory({ onHome }: { onHome?: () => void }) {
  const [session, setSession] = useState(0)
  const [state, dispatch] = useReducer(storyReducer, initialState)
  const [muted, setMuted] = useState(false)
  const [overlay, setOverlay] = useState<'parent' | 'pause' | null>(null)
  const [audioFailed, setAudioFailed] = useState(false)
  const [speech] = useState(() => new EdgeAudioProvider(setAudioFailed))
  const guard = useInteractionGuard()
  const stateRef = useRef(state)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const round = rounds[state.round] ?? rounds[0]
  const active = state.phase === 'playing' || state.phase === 'matched'
  const ended = state.phase === 'finished' || state.phase === 'goodbye'
  const message = narration(state)
  const completed = state.found

  function speak(text: string, force = false) {
    const done =
      stateRef.current.phase === 'matched'
        ? guard.hold(FEEDBACK_MIN_MS, true)
        : undefined
    if ((muted && !force) || !speech.available) {
      done?.()
      return
    }
    try {
      speech.speak({ text, onComplete: done })
    } catch {
      setAudioFailed(true)
      done?.()
    }
  }
  function act(event: StoryEvent) {
    if (event.type !== 'close' && (guard.isLocked() || overlay)) return
    const previous = stateRef.current
    const next = storyReducer(previous, event)
    if (next === previous) return
    guard.hold()
    stateRef.current = next
    if (event.type === 'start') setSession((value) => value + 1)
    dispatch(event)
    speak(
      event.type === 'start' && previous.phase === 'welcome'
        ? `${narration(previous)}${narration(next)}`
        : narration(next),
    )
  }
  function openOverlay(kind: 'parent' | 'pause') {
    speech.cancel()
    guard.finishAudio()
    setOverlay(kind)
  }
  function closeOverlay() {
    setOverlay(null)
    if (state.phase !== 'welcome') speak(message)
  }
  useEffect(() => () => speech.dispose(), [speech])
  useEffect(() => {
    if (overlay) dialogRef.current?.showModal()
    else dialogRef.current?.close()
  }, [overlay])
  useEffect(() => {
    if (state.phase !== 'welcome')
      headingRef.current?.focus({ preventScroll: true })
  }, [state.phase, state.round])
  useEffect(() => {
    const hide = () => {
      if (document.hidden) {
        speech.cancel()
        if (active) setOverlay('pause')
      }
    }
    document.addEventListener('visibilitychange', hide)
    return () => document.removeEventListener('visibilitychange', hide)
  }, [active, speech])

  return (
    <main className={`play-shell ${overlay ? 'is-paused' : ''}`}>
      <header className="play-header">
        {onHome ? (
          <button className="parent-button" onClick={onHome}>
            ← 故事小屋
          </button>
        ) : (
          <>
            <a className="play-brand" href="./" aria-label="TaleMotion 首页">
              <span className="brand-ears" aria-hidden="true">
                m
              </span>
              <span>
                TaleMotion<small>陪孩子，玩进故事里</small>
              </span>
            </a>
          </>
        )}
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label={muted ? '打开声音' : '关闭声音'}
            aria-pressed={muted}
            onClick={() => {
              if (!muted) {
                speech.cancel()
                guard.finishAudio()
              } else speak(message, true)
              setMuted(!muted)
            }}
          >
            <Icon name={muted ? 'muted' : 'sound'} />
          </button>
          {active && (
            <button
              className="icon-button"
              aria-label="暂停故事"
              onClick={() => openOverlay('pause')}
            >
              <Icon name="pause" />
            </button>
          )}
          <button
            className="parent-button"
            onClick={() => openOverlay('parent')}
          >
            家长陪玩
          </button>
        </div>
      </header>

      <section
        {...guard.gestureProps}
        className={`storybook phase-${state.phase}`}
        aria-label="手套找朋友互动故事"
      >
        <div className="story-world">
          <Forest />
          <div className="world-label">
            <span aria-hidden="true">✦</span> 兔子警官的森林日常
          </div>
          <div className="rabbit-position">
            <Rabbit happy={state.phase === 'matched' || ended} />
          </div>
          {active && (
            <div className="friend-position" key={round.animal}>
              <Friend animal={round.animal} happy={state.phase === 'matched'} />
              <span>{round.friend}</span>
            </div>
          )}
          {(state.phase === 'welcome' || ended) && (
            <div className="welcome-friends">
              <Friend animal="bear" happy={ended} />
              <Friend animal="fox" happy={ended} />
              <Friend animal="cat" happy={ended} />
            </div>
          )}
          <div className="rabbit-name">
            <i aria-hidden="true">✦</i> 朵朵警官
          </div>
          <div className="world-caption">
            {state.phase === 'welcome'
              ? '今天，森林里需要一位小帮手。'
              : state.phase === 'matched'
                ? `${round.friend}：谢谢你，帮我找到了！`
                : ended
                  ? '小小的帮助，让森林暖暖的。'
                  : `${round.friend}：我的另一只手套在哪儿呢？`}
          </div>
        </div>

        <div className="story-panel">
          {state.phase === 'welcome' ? (
            <div className="welcome-panel">
              <div className="episode-label">
                亲子互动故事 <span>·</span> 找相同
              </div>
              <h1>
                手套
                <br />
                <span>找朋友</span>
                <i aria-hidden="true">✳</i>
              </h1>
              <p className="welcome-copy">
                小伙伴的手套混在一起啦。
                <br />
                和朵朵警官一起，帮它们配成一对吧！
              </p>
              <div className="mitten-preview" aria-hidden="true">
                <Mitten kind="stripe" />
                <span>＋</span>
                <Mitten kind="stripe" mirror />
              </div>
              <button
                className="big-button"
                onClick={() => act({ type: 'start' })}
              >
                一起出发 <Icon name="arrow" />
              </button>
              <p className="session-note">
                2.5–4 岁 · 约 3 分钟 · 和大人一起玩
              </p>
            </div>
          ) : active ? (
            <div className="mission-panel">
              <div className="mission-topline">
                <span>帮{round.friend}找手套</span>
                <span className="round-count">{state.round + 1} / 3</span>
              </div>
              <h1 ref={headingRef} tabIndex={-1}>
                {state.phase === 'matched'
                  ? '一样的，找到啦！'
                  : '哪一只和它一样？'}
              </h1>
              <div
                className={`reference-tray ${state.phase === 'matched' ? 'is-paired' : ''}`}
              >
                <Mitten kind={round.target} />
                {state.phase === 'matched' ? (
                  <Mitten kind={round.target} mirror />
                ) : (
                  <div className="missing-mitten" aria-hidden="true">
                    ?
                  </div>
                )}
                <span className="tray-label">
                  {state.phase === 'matched'
                    ? '两只一样，正好一对'
                    : `${round.friend}的手套`}
                </span>
              </div>
              <div
                className={`spoken-line ${state.wrong ? 'is-hint' : ''}`}
                aria-live="polite"
              >
                <p>
                  {state.phase === 'matched'
                    ? `把手套送给${round.friend}吧。`
                    : state.wrong
                      ? `再看看，${mittens[round.target].detail}。`
                      : '看看上面，再点一点下面。'}
                </p>
                <button
                  className="icon-button"
                  aria-label="再听一遍"
                  disabled={muted}
                  onClick={() => speak(message)}
                >
                  <Icon name="sound" />
                </button>
              </div>
              {state.phase === 'playing' ? (
                <div
                  className="choices"
                  role="group"
                  aria-label="选择相同的手套"
                >
                  {(session % 2 === 0
                    ? [...round.choices].reverse()
                    : round.choices
                  ).map((kind) => (
                    <button
                      key={kind}
                      className={`choice ${state.wrong === kind ? 'was-tried' : ''}`}
                      aria-label={mittens[kind].name}
                      disabled={guard.locked}
                      onClick={() => act({ type: 'choose', kind })}
                    >
                      <Mitten kind={kind} />
                      <span>
                        {state.wrong === kind ? '不一样，再找找' : '选这一只'}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="deliver-action">
                  <p className="feedback-wait" role="status">
                    {guard.locked
                      ? '看看，小伙伴在说谢谢呢…'
                      : '现在可以把手套送给它啦'}
                  </p>
                  <div className="pair-note">
                    <Icon name="leaf" />
                    <span>你帮{round.friend}找齐了手套</span>
                  </div>
                  <button
                    className="big-button"
                    disabled={guard.locked}
                    onClick={() => act({ type: 'next' })}
                  >
                    送给{round.friend}
                    <Icon name="arrow" />
                  </button>
                </div>
              )}
              <div
                className="friend-progress"
                aria-label={`已经找到 ${completed} 对手套`}
              >
                {rounds.map((item, i) => (
                  <span
                    key={item.animal}
                    className={i < completed ? 'done' : ''}
                  >
                    <i aria-hidden="true">{i < completed ? '✓' : '○'}</i>
                    {item.friend}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="ending-panel">
              <div className="episode-label">
                {state.phase === 'finished'
                  ? '森林服务站 · 今日任务完成'
                  : '森林服务站 · 休息一下'}
              </div>
              <div className="ending-seal" aria-hidden="true">
                <Icon name="leaf" />
              </div>
              <h1 ref={headingRef} tabIndex={-1}>
                {state.phase === 'finished'
                  ? '谢谢你，小帮手！'
                  : '下次再一起玩'}
              </h1>
              <p>
                {state.phase === 'finished'
                  ? '三位小伙伴，都有暖暖的手套啦。'
                  : '朵朵警官在森林里等你。'}
              </p>
              <div className="offline-card">
                <span>把故事带回生活</span>
                <h2>去找一双真的袜子吧</h2>
                <p>
                  和爸爸妈妈一起看看：
                  <br />
                  哪两只袜子，是一对好朋友？
                </p>
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
                className="parent-button"
                onClick={() => openOverlay('parent')}
              >
                记录这次试玩
              </button>
              {onHome && (
                <button className="parent-button" onClick={onHome}>
                  回故事小屋
                </button>
              )}
              <button
                className="replay-button"
                onClick={() => act({ type: 'start' })}
              >
                <Icon name="repeat" /> 再玩一次
              </button>
            </div>
          )}
          {(!speech.available || audioFailed) && (
            <p className="audio-note" role="status">
              当前旁白暂不可用，大人可以读出提示，一起继续玩。
              <button
                className="parent-button"
                onClick={() => {
                  setMuted(false)
                  speak(message, true)
                }}
              >
                重试声音
              </button>
            </p>
          )}
        </div>
      </section>
      <footer className="play-footer">
        <span>
          <Icon name="leaf" /> 慢慢观察，小小发现
        </span>
        <span>没有倒计时，按孩子的节奏来</span>
      </footer>

      <dialog
        className="parent-dialog"
        ref={dialogRef}
        onCancel={(event) => {
          event.preventDefault()
          closeOverlay()
        }}
        aria-labelledby="dialog-title"
      >
        {overlay === 'pause' ? (
          <>
            <span className="episode-label">朵朵会在这里等你</span>
            <h2 id="dialog-title">歇一小会儿</h2>
            <p>
              手套还在原来的位置。
              <br />
              准备好了，我们再接着找。
            </p>
            <button className="big-button" onClick={closeOverlay}>
              继续故事 <Icon name="arrow" />
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
            <span className="episode-label">给陪玩的你</span>
            <h2 id="dialog-title">一起找，慢慢来</h2>
            <p>
              这一集只练习一件事：观察两件物品是不是相同。年龄仅作参考，跟着孩子的状态来。
            </p>
            <ol>
              <li>
                <strong>先等一等。</strong>
                让孩子自己看一会儿，可以用手指，也可以说出来。
              </li>
              <li>
                <strong>描述代替报答案。</strong>
                试着说“这只有圆点”，不用催着选对。
              </li>
              <li>
                <strong>玩完就去动手。</strong>
                拿真实的袜子配一对，看看换个场景还能不能认出来。
              </li>
            </ol>
            <div className="parent-observation">
              <strong>这次的小记录</strong>
              <p>
                {state.phase === 'welcome'
                  ? '还没有开始。全程没有计时和分数。'
                  : `已找到 ${completed} 对；各轮尝试次数：${state.attempts.join(' / ')}。`}
              </p>
              <small>仅保留在本页，刷新清除。次数不代表能力评分。</small>
            </div>
            {state.phase !== 'welcome' && (
              <ObservationForm
                key={session}
                story="手套找朋友"
                attempts={state.attempts}
                completed={completed}
              />
            )}
            <p className="parent-small">
              原创角色 · 无广告 · 不采集录音
              <br />
              旁白为预先生成的中文音频；没有声音时，可重试或由大人读提示。
            </p>
            <button className="big-button" onClick={closeOverlay}>
              知道啦 <Icon name="arrow" />
            </button>
          </>
        )}
      </dialog>
    </main>
  )
}
