import { writeFileSync, readFileSync } from 'node:fs'
import {
  activities,
  newActivityState,
  activityNarration,
} from '../src/play/activities'
import { initialState, narration, rounds } from '../src/play/story'
const lines = new Set<string>()
for (const phase of ['welcome', 'finished', 'goodbye'] as const)
  lines.add(narration({ ...initialState, phase }))
rounds.forEach((round, index) => {
  const state = { ...initialState, round: index, phase: 'playing' as const }
  lines.add(narration(state))
  lines.add(narration({ ...state, phase: 'matched' }))
  lines.add(
    narration({
      ...state,
      wrong: round.choices.find((x) => x !== round.target)!,
    }),
  )
})
lines.add(
  narration(initialState) + narration({ ...initialState, phase: 'playing' }),
)
for (const activity of activities) {
  lines.add(activity.intro)
  lines.add(activity.ending)
  lines.add(activity.intro + activity.rounds[0].prompt)
  lines.add(
    activityNarration(activity, {
      ...newActivityState(activity),
      phase: 'goodbye',
    }),
  )
  activity.rounds.forEach((round) =>
    [round.prompt, round.hint, round.success].forEach((line) =>
      lines.add(line),
    ),
  )
}
const classic = JSON.parse(
  readFileSync('src/demo/winter-cottage.scene.json', 'utf8'),
)
for (const action of classic.timeline)
  if (action.type === 'audio.play' && action.text) lines.add(action.text)
writeFileSync(
  'scripts/narration-input.json',
  JSON.stringify([...lines], null, 2) + '\n',
)
console.log(`Collected ${lines.size} narration lines`)
