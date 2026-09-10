import { useEffect, useState } from 'react'
import { activities } from './activities'
import { ActivityArt } from './ActivityArt'
import { ActivityPlayer } from './ActivityPlayer'
import { Forest, Icon, Mitten, Rabbit } from './Artwork'
import { MatchingStory } from './MatchingStory'
import { ObservationHistory } from './Observation'
import { MittenAdventure } from './MittenAdventurePlayer'
import { DressedBear } from './AdventureArt'
import { storyPacks } from '../stories/library'
import { PackPlayer } from '../stories/PackPlayer'
import { StoryArt, StoryBackdrop } from '../stories/StoryArt'

function selectedStory() {
  const id = new URLSearchParams(window.location.search).get('story')
  return id === 'mittens' ||
    id === 'mittens-story' ||
    storyPacks.some((pack) => pack.id === id) ||
    activities.some((activity) => activity.id === id)
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
  const pack = storyPacks.find((item) => item.id === selected)
  if (pack)
    return <PackPlayer key={pack.id} pack={pack} onHome={() => choose(null)} />
  if (selected === 'mittens-story')
    return (
      <MittenAdventure
        onHome={() => choose(null)}
        onClassic={() => choose('mittens')}
      />
    )
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
        <span className="library-age">亲子共玩 · 按孩子的节奏来</span>
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
      <section className="pack-shelf" aria-labelledby="pack-shelf-title">
        <div className="shelf-heading">
          <h2 id="pack-shelf-title">和朋友，走进故事里</h2>
          <span>3–4 岁 · 可以陪着玩</span>
        </div>
        <div className="pack-grid">
          {storyPacks.map((item) => {
            const first = item.nodes.find((node) => node.id === item.start)!
            const actor =
              first.entities.find((entity) => entity.slot === 'actor-left') ??
              first.entities[0]!
            const prop =
              item.nodes
                .flatMap((node) => node.entities)
                .find((entity) => entity.slot.startsWith('prop-')) ??
              first.entities[0]!
            return (
              <button
                key={item.id}
                className="pack-card"
                onClick={() => choose(item.id)}
              >
                <div className="pack-cover">
                  <StoryBackdrop kind={first.backdrop} />
                  <div className="pack-cover-actor">
                    <StoryArt entity={actor} />
                  </div>
                  <div className="pack-cover-prop">
                    <StoryArt entity={prop} />
                  </div>
                </div>
                <div className="pack-card-copy">
                  <span>
                    {item.theme === 'help'
                      ? '找一找，帮个忙'
                      : item.theme === 'build'
                        ? '你帮我，我帮你'
                        : '听一听，商量着玩'}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <span className="story-open">
                    走进故事 <Icon name="arrow" />
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>
      <button
        className="adventure-feature"
        onClick={() => choose('mittens-story')}
      >
        <div className="adventure-feature-art">
          <DressedBear warm />
          <Mitten kind="stripe" mirror />
        </div>
        <div className="adventure-feature-copy">
          <span>第一版故事样片 · 保留对照</span>
          <h2>雪地里的手套</h2>
          <p>帮小熊找回手套，再一起玩一场雪。</p>
          <span className="story-open">
            走进故事 <Icon name="arrow" />
          </span>
        </div>
      </button>
      <section className="story-shelf" aria-labelledby="shelf-title">
        <div className="shelf-heading">
          <h2 id="shelf-title">熟悉的小活动</h2>
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
