import { useEffect, useState } from 'react'
import { activities } from './activities'
import { ActivityArt } from './ActivityArt'
import { ActivityPlayer } from './ActivityPlayer'
import { Forest, Icon, Mitten, Rabbit } from './Artwork'
import { MatchingStory } from './MatchingStory'
import { ObservationHistory } from './Observation'

function selectedStory() {
  const id = new URLSearchParams(window.location.search).get('story')
  return id === 'mittens' || activities.some((activity) => activity.id === id)
    ? id
    : null
}
export function StoryLibrary() {
  const [selected, setSelected] = useState(selectedStory)
  useEffect(() => {
    const change = () => setSelected(selectedStory())
    window.addEventListener('popstate', change)
    return () => window.removeEventListener('popstate', change)
  }, [])
  function choose(id: string | null) {
    const url = new URL(window.location.href)
    if (id) url.searchParams.set('story', id)
    else url.searchParams.delete('story')
    window.history.pushState({}, '', url)
    setSelected(id)
    window.scrollTo(0, 0)
  }
  if (selected === 'mittens')
    return <MatchingStory onHome={() => choose(null)} />
  const activity = activities.find((item) => item.id === selected)
  if (activity)
    return (
      <ActivityPlayer
        key={activity.id}
        activity={activity}
        onHome={() => choose(null)}
      />
    )
  return (
    <main className="play-shell library-shell">
      <header className="play-header">
        <a href="./" className="play-brand">
          <span className="brand-ears" aria-hidden="true">
            m
          </span>
          <span>
            TaleMotion<small>陪孩子，玩进故事里</small>
          </span>
        </a>
        <span className="library-age">2.5–4 岁 · 亲子共玩</span>
      </header>
      <section className="library-welcome">
        <div className="library-landscape">
          <Forest />
          <Rabbit happy />
        </div>
        <div className="library-intro">
          <div className="episode-label">兔子警官的森林日常</div>
          <h1>
            今天，一起
            <br />
            <span>帮个小忙吧</span>
          </h1>
          <p>
            找一找，试一试。
            <br />
            跟着朵朵警官，把小发现带回生活。
          </p>
          <span className="session-note">一次选一个故事，按孩子的节奏来。</span>
        </div>
      </section>
      <section className="story-shelf" aria-labelledby="shelf-title">
        <div className="shelf-heading">
          <h2 id="shelf-title">从哪个故事开始？</h2>
          <span>每个约 2–4 分钟</span>
        </div>
        <div className="story-grid">
          <button
            className="story-card card-mittens"
            onClick={() => choose('mittens')}
          >
            <div className="story-cover">
              <Mitten kind="stripe" />
              <Mitten kind="stripe" mirror />
            </div>
            <div className="story-card-copy">
              <span>找相同 · 2.5–4 岁</span>
              <h3>手套找朋友</h3>
              <p>帮小伙伴，把手套配成一对。</p>
              <span className="story-open">
                打开故事 <Icon name="arrow" />
              </span>
            </div>
          </button>
          {activities.map((item) => (
            <button
              key={item.id}
              className={`story-card card-${item.id}`}
              onClick={() => choose(item.id)}
            >
              <div className="story-cover">
                <ActivityArt item={item.cover} />
              </div>
              <div className="story-card-copy">
                <span>
                  {item.skill} ·{' '}
                  {item.id === 'garden' ? '3–4 岁，可陪做' : '2.5–4 岁'}
                </span>
                <h3>{item.title}</h3>
                <p>
                  {item.id === 'picnic'
                    ? '大碗、小杯子，野餐要出发啦。'
                    : item.id === 'hide'
                      ? '里面、上面、下面，小球在哪儿？'
                      : '先装水，再浇花，照顾小生命。'}
                </p>
                <span className="story-open">
                  打开故事 <Icon name="arrow" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
      <ObservationHistory />
      <footer className="play-footer">
        <span>
          <Icon name="leaf" />
          没有分数，也不用赶时间
        </span>
        <span>原创故事 · 无广告 · 不采集录音</span>
      </footer>
    </main>
  )
}
