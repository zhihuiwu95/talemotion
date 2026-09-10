import { writeFileSync, readFileSync, readdirSync } from 'node:fs'
import { storySchema } from '../src/stories/schema'
import {
  activities,
  newActivityState,
  activityNarration,
} from '../src/play/activities'
import { initialState, narration, rounds } from '../src/play/story'
import { adventureLines, type VoiceStyle } from '../src/play/adventureStory'
const lines = new Map<
  string,
  {
    text: string
    style: VoiceStyle
    styleDegree: string
    rate: string
    pitch: string
  }
>()
function add(text: string, style: VoiceStyle = 'story') {
  const existing = lines.get(text)
  if (existing && existing.style !== style)
    throw new Error(`Same narration text has conflicting styles: ${text}`)
  lines.set(text, {
    text,
    style,
    styleDegree: style === 'excited' ? '1.1' : '1.0',
    rate: '-5%',
    pitch: '+0Hz',
  })
}
for (const phase of ['welcome', 'finished', 'goodbye'] as const)
  add(
    narration({ ...initialState, phase }),
    phase === 'welcome' ? 'story' : 'affectionate',
  )
rounds.forEach((round, index) => {
  const state = { ...initialState, round: index, phase: 'playing' as const }
  add(narration(state))
  add(narration({ ...state, phase: 'matched' }), 'cheerful')
  add(
    narration({
      ...state,
      wrong: round.choices.find((x) => x !== round.target)!,
    }),
    'empathetic',
  )
})
add(narration(initialState) + narration({ ...initialState, phase: 'playing' }))
for (const activity of activities) {
  add(activity.intro)
  add(activity.ending, 'affectionate')
  add(activity.intro + activity.rounds[0].prompt)
  add(
    activityNarration(activity, {
      ...newActivityState(activity),
      phase: 'goodbye',
    }),
    'affectionate',
  )
  activity.rounds.forEach((round) => {
    add(round.prompt)
    add(round.hint, 'empathetic')
    add(round.success, 'cheerful')
  })
}
for (const line of Object.values(adventureLines)) add(line.text, line.style)
for (const file of readdirSync('src/stories/packs').filter((name) =>
  name.endsWith('.json'),
)) {
  const pack = storySchema.parse(
    JSON.parse(readFileSync(`src/stories/packs/${file}`, 'utf8')),
  )
  for (const node of pack.nodes) add(node.line.text, node.line.style)
}
const classic = JSON.parse(
  readFileSync('src/demo/winter-cottage.scene.json', 'utf8'),
)
for (const action of classic.timeline)
  if (action.type === 'audio.play' && action.text) add(action.text)
writeFileSync(
  'scripts/narration-input.json',
  JSON.stringify([...lines.values()], null, 2) + '\n',
)
console.log(
  `Collected ${lines.size} narration lines with explicit speaking styles`,
)
