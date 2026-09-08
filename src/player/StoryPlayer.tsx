import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import type { SceneDefinition } from '../schema/scene'
import { SceneRuntime } from '../runtime/SceneRuntime'
import type { PlaybackState } from '../runtime/PlaybackController'
import { formatClockTime, formatCueTime, formatDurationLabel } from './time'

interface StoryPlayerProps {
  scene: SceneDefinition
}

export function StoryPlayer({ scene }: StoryPlayerProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const runtimeRef = useRef<SceneRuntime | null>(null)
  const [state, setState] = useState<PlaybackState>('ready')
  const [time, setTime] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const cues = useMemo(
    () => scene.timeline.filter((action) => action.label),
    [scene.timeline],
  )
  const activeCaption = scene.captions.find(
    (caption) => time >= caption.start && time < caption.end,
  )
  const progress = Math.min(100, Math.max(0, (time / scene.duration) * 100))

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let cancelled = false
    const runtime = new SceneRuntime(scene, {
      onTime: (nextTime) => {
        if (!cancelled) setTime(nextTime)
      },
      onStateChange: (nextState) => {
        if (!cancelled) setState(nextState)
      },
      onWarning: (message) => {
        if (!cancelled) setWarning(message)
      },
    })

    void runtime
      .mount(host)
      .then(() => {
        if (cancelled) {
          runtime.dispose()
          return
        }
        runtimeRef.current = runtime
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setError('请刷新页面重试，并确认本地故事素材完整。')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
      runtimeRef.current = null
      runtime.dispose()
    }
  }, [scene])

  const togglePlayback = useCallback(() => {
    const runtime = runtimeRef.current
    if (!runtime || loading) return
    if (state === 'playing') runtime.pause()
    else runtime.play()
  }, [loading, state])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat || isInteractiveTarget(event.target)) return
      event.preventDefault()
      togglePlayback()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlayback])

  useEffect(() => {
    if (!isFullscreen) return
    const previousOverflow = document.body.style.overflow
    const exitOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFullscreen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', exitOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', exitOnEscape)
    }
  }, [isFullscreen])

  const restart = () => {
    if (!runtimeRef.current || loading) return
    setWarning(null)
    runtimeRef.current.restart()
  }

  const primaryLabel =
    state === 'playing'
      ? '暂停故事'
      : state === 'paused'
        ? '继续故事'
        : state === 'complete'
          ? '再次播放'
          : '播放故事'

  return (
    <main className="player-shell">
      <header className="site-header">
        <a className="brand" href="#player" aria-label="TaleMotion 首页">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="brand-copy">
            <strong>TaleMotion</strong>
            <small>让故事动起来。</small>
          </span>
        </a>
        <div className="build-note">
          <span className="status-dot" aria-hidden="true" />
          黄金样片 · 本地运行
        </div>
      </header>

      <section className="story-intro" aria-labelledby="scene-title">
        <div>
          <p className="eyebrow">演示故事 · {formatDurationLabel(scene.duration)}</p>
          <h1 id="scene-title">{scene.title}</h1>
        </div>
        <p className="intro-copy">
          一只小兔，一束穿过松林的微光，还有一扇缓缓打开的门——整场演出都由
          经过验证的场景数据驱动，而不是写死的动画。
        </p>
      </section>

      <section className="player-layout" id="player">
        <div className="stage-column">
          <div
            className={`stage-frame ${isFullscreen ? 'is-fullscreen' : ''}`}
          >
            <div className="stage-meta" aria-hidden="true">
              <span>场景 {scene.sceneId}</span>
              <span>{scene.viewport.width} × {scene.viewport.height}</span>
            </div>

            <button
              className="fullscreen-control"
              type="button"
              onClick={() => setIsFullscreen((current) => !current)}
              aria-label={isFullscreen ? '退出全屏' : '全屏观看'}
              title={isFullscreen ? '退出全屏' : '全屏观看'}
            >
              {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
              <span>{isFullscreen ? '退出全屏' : '全屏观看'}</span>
            </button>

            <div className="canvas-host" ref={hostRef} />
            {loading && !error && (
              <div className="stage-message" role="status">
                <span className="loading-moon" aria-hidden="true" />
                <strong>正在布置舞台</strong>
                <small>正在加载本地故事素材…</small>
              </div>
            )}
            {error && (
              <div className="stage-message stage-message--error" role="alert">
                <strong>场景未能启动</strong>
                <small>{error}</small>
              </div>
            )}

            {!loading && !error && state === 'ready' && (
              <button className="stage-play" type="button" onClick={togglePlayback}>
                <PlayIcon />
                <span>开始故事</span>
              </button>
            )}

            {!loading && !error && (
              <div className={`caption-card ${activeCaption ? 'is-visible' : ''}`}>
                <span>{activeCaption?.speaker ?? 'TaleMotion'}</span>
                <p>{activeCaption?.text ?? '点击播放，故事即将开始。'}</p>
              </div>
            )}
          </div>

          <div className="transport" aria-label="播放控制">
            <div className="transport-buttons">
              <button
                className="primary-control"
                type="button"
                onClick={togglePlayback}
                disabled={loading || Boolean(error)}
              >
                {state === 'playing' ? <PauseIcon /> : <PlayIcon />}
                {primaryLabel}
              </button>
              <button
                className="secondary-control"
                type="button"
                onClick={restart}
                disabled={loading || Boolean(error)}
              >
                <RestartIcon />
                重新开始
              </button>
            </div>

            <div className="time-readout" aria-live="off">
              <span>{formatClockTime(time)}</span>
              <span className="time-divider">/</span>
              <span>{formatClockTime(scene.duration)}</span>
            </div>

            <div
              className="story-ribbon"
              style={{ '--story-progress': `${progress}%` } as CSSProperties}
              role="progressbar"
              aria-label="故事进度"
              aria-valuemin={0}
              aria-valuemax={scene.duration}
              aria-valuenow={Number(time.toFixed(1))}
            >
              <div className="ribbon-track">
                <div className="ribbon-fill" />
                {cues.map((cue) => (
                  <span
                    key={cue.id ?? `${cue.type}-${cue.at}`}
                    className={`ribbon-knot ${time >= cue.at ? 'is-past' : ''}`}
                    style={{ left: `${(cue.at / scene.duration) * 100}%` }}
                  />
                ))}
              </div>
            </div>
            <span className="keyboard-hint">按空格键播放或暂停</span>
          </div>

          {warning && (
            <div className="runtime-warning" role="status">
              <span aria-hidden="true">i</span>
              {warning}
            </div>
          )}
        </div>

        <aside className="cue-sheet" aria-label="故事节点">
          <div className="cue-heading">
            <p className="eyebrow">导演场记带</p>
            <h2>故事节点</h2>
            <p>每个节点都来自驱动舞台的同一份场景文件。</p>
          </div>
          <ol>
            {cues.map((cue, index) => {
              const isPast = time >= cue.at
              const nextCue = cues[index + 1]
              const isCurrent = isPast && (!nextCue || time < nextCue.at)
              return (
                <li
                  key={cue.id ?? `${cue.type}-${cue.at}`}
                  className={`${isPast ? 'is-past' : ''} ${isCurrent ? 'is-current' : ''}`}
                >
                  <span className="cue-time">{formatCueTime(cue.at)}</span>
                  <span className="cue-line" aria-hidden="true" />
                  <span className="cue-label">{cue.label}</span>
                </li>
              )
            })}
          </ol>
          <div className="contract-card">
            <span className="contract-icon" aria-hidden="true">✓</span>
            <div>
              <strong>场景契约验证通过</strong>
              <p>{scene.objects.length} 个对象 · {scene.timeline.length} 个动作 · 本地素材</p>
            </div>
          </div>
        </aside>
      </section>

      <footer className="site-footer">
        <span>场景 JSON</span>
        <span>PixiJS 渲染器</span>
        <span>GSAP 时间轴</span>
        <span>中文录制旁白</span>
      </footer>
    </main>
  )
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && Boolean(target.closest('button, a, input, textarea'))
}

function PlayIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
      <path d="M8 5.5v13l10-6.5L8 5.5Z" fill="currentColor" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
      <path d="M7 5h4v14H7zm6 0h4v14h-4z" fill="currentColor" />
    </svg>
  )
}

function RestartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
      <path d="M6.2 7.4A7 7 0 1 1 5 14h2.1a5 5 0 1 0 1-5l2.4 2.4H4V5l2.2 2.4Z" fill="currentColor" />
    </svg>
  )
}

function FullscreenIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17">
      <path d="M4 9V4h5v2H6v3H4Zm11-5h5v5h-2V6h-3V4ZM6 15v3h3v2H4v-5h2Zm12 0h2v5h-5v-2h3v-3Z" fill="currentColor" />
    </svg>
  )
}

function ExitFullscreenIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17">
      <path d="M9 4v5H4V7h3V4h2Zm6 0h2v3h3v2h-5V4ZM4 15h5v5H7v-3H4v-2Zm11 0h5v2h-3v3h-2v-5Z" fill="currentColor" />
    </svg>
  )
}
