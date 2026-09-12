import { createHash } from 'node:crypto'
import config from './tts-config.json'
import pronunciationReview from './pronunciation-review.json'
import { speechLineSchema, type SpeechLine, type VoiceEmotion, type VoiceIntent } from '../src/stories/speech'

export const legacyEmotion: Record<string, VoiceEmotion> = {
  story: 'neutral', affectionate: 'warm', cheerful: 'cheerful', excited: 'excited', empathetic: 'empathetic',
}
export function collectLine(source: string, value: SpeechLine, defaultIntent: VoiceIntent = 'dialogue') {
  let line = speechLineSchema.parse(value)
  const registration = (config.speakers as Record<string, { speaker: string; voiceProfile: string }>)[line.speaker]
  if (!registration) throw new Error(`Register speaker before synthesis: ${line.speaker}`)
  // Legacy entry points have no authored speech object; use an exact, reviewed line match.
  if (!source.startsWith('pack:') && !line.segments) {
    const review = pronunciationReview.entries.find(entry => entry.source === source && entry.speaker === registration.speaker && entry.text === line.text)
    if (review?.pronunciations.length) line = speechLineSchema.parse({ ...line, segments: [{ text: line.text, pronunciations: review.pronunciations }] })
  }
  const voiceProfile = line.voiceProfile ?? registration.voiceProfile
  if (!(voiceProfile in config.voiceProfiles)) throw new Error(`Unknown voice profile: ${voiceProfile}`)
  const { style, ...rest } = line
  // Legacy style supplies emotion only. Explicit emotion takes precedence; with
  // an explicit emotion, style is an optional deliberate Azure override.
  const direction = {
    ...rest,
    speaker: registration.speaker,
    speakerLabel: line.speaker,
    voiceProfile,
    intent: line.intent ?? (defaultIntent === 'ending' ? 'ending' : style === 'empathetic' ? 'hint' : style === 'excited' ? 'success' : defaultIntent),
    emotion: line.emotion ?? legacyEmotion[style ?? 'story'] ?? 'neutral',
    ...(line.emotion && style ? { style } : {}),
    legacyStyle: style ?? 'story',
  }
  const digest = createHash('sha256').update(JSON.stringify(direction)).digest('hex').slice(0, 20)
  return { id: `${source}:${digest}`, source, ...direction }
}
export type NarrationLine = ReturnType<typeof collectLine>
