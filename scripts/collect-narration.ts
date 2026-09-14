import { writeFileSync, readFileSync, readdirSync } from 'node:fs'
import { storySchema } from '../src/stories/schema'
import {
  activities,
  newActivityState,
  activityNarration,
} from '../src/play/activities'
import { initialState, narration, rounds } from '../src/play/story'
import { adventureLines, type VoiceStyle } from '../src/play/adventureStory'
import { collectLine, type NarrationLine } from './narration'
const lines = new Map<string, NarrationLine>()
const sources: Record<string, string> = {}
const soundCues: Record<string, string> = {}
const legacy: Record<string, string> = {}
function add(text: string, style: VoiceStyle = 'story', speaker = 'duoduo') {
  const line = collectLine('legacy', { text, style, speaker }, 'narration')
  if (legacy[text] && legacy[text] !== line.id) throw new Error('Ambiguous legacy text binding; use an explicit source ID')
  lines.set(line.id, line)
  legacy[text] = line.id // Compatibility lookup for original text-only activities only.
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
for (const [key, value] of Object.entries(adventureLines)) {
  const { cue: _cue, ...speech } = value
  void _cue
  const source = `adventure:${key}`
  const line = collectLine(source, speech, key.startsWith('ending-') ? 'ending' : 'dialogue')
  lines.set(line.id, line)
  sources[source] = line.id
}
for (const file of readdirSync('src/stories/packs').filter((name) =>
  name.endsWith('.json'),
)) {
  const pack = storySchema.parse(
    JSON.parse(readFileSync(`src/stories/packs/${file}`, 'utf8')),
  )
  for (const node of pack.nodes) {
    const source = `pack:${pack.id}:${node.id}`
    const line = collectLine(source, node.line, node.kind === 'ending' ? 'ending' : node.kind === 'interactive' ? 'prompt' : 'dialogue')
    lines.set(line.id, line)
    sources[source] = line.id
    if ('soundCue' in node && node.soundCue) soundCues[source] = node.soundCue
  }
}
const classic = JSON.parse(
  readFileSync('src/demo/winter-cottage.scene.json', 'utf8'),
)
for (const action of classic.timeline)
  if (action.type === 'audio.play' && action.text) add(action.text, 'story', 'narrator')
writeFileSync(
  'scripts/narration-input.json',
  JSON.stringify([...lines.values()], null, 2) + '\n',
)
writeFileSync('src/generated/narration-index.json', JSON.stringify({ sources, legacy }, null, 2) + '\n')
writeFileSync('scripts/narration-directions.json', JSON.stringify({ soundCues }, null, 2) + '\n')
console.log(
  `Collected ${lines.size} narration lines with speaker-aware identities`,
)

// A disposable projection of the published manifest. Shipping SSML and all
// production metadata to children would needlessly enlarge the application.
const published = JSON.parse(readFileSync('src/generated/narration.json', 'utf8')) as {
  schemaVersion?: number
  clips: Record<string, { src?: string; output?: { src: string } }>
}
if (published.schemaVersion === 2 || published.schemaVersion === 3) {
  writeFileSync('src/generated/narration-playback.json', JSON.stringify(
    Object.fromEntries(Object.entries(published.clips).map(([id, clip]) => [id, published.schemaVersion === 3 ? clip.output!.src : clip.src])), null, 2,
  ) + '\n')
}
