import { z } from 'zod'

export const voiceIntents = ['narration', 'dialogue', 'prompt', 'hint', 'success', 'comfort', 'question', 'ending'] as const
export const voiceEmotions = ['neutral', 'warm', 'gentle', 'curious', 'cheerful', 'excited', 'empathetic', 'sad', 'surprised'] as const
export type VoiceIntent = (typeof voiceIntents)[number]
export type VoiceEmotion = (typeof voiceEmotions)[number]
const rate = z.string().regex(/^[+-](?:[0-9]|[12][0-9]|30)%$/)
const pitch = z.string().regex(/^[+-](?:[0-9]|10)Hz$/)
const overrides = {
  style: z.string().regex(/^[a-z][a-z-]{0,39}$/).optional(),
  styleDegree: z.number().min(0.01).max(2).optional(),
  rate: rate.optional(),
  pitch: pitch.optional(),
}
const pronunciations = z.array(z.object({
  text: z.string().min(1).max(40),
  occurrence: z.number().int().min(1).max(300).optional(),
  phoneme: z.string().max(240).regex(/^[a-zv]+[1-5]( [a-zv]+[1-5])*$/),
}).strict()).min(1).max(32).optional()
const segment = z.union([
  z.object({ text: z.string().min(1).max(300), emotion: z.enum(voiceEmotions).optional(), pronunciations, ...overrides }).strict(),
  z.object({ pauseMs: z.number().int().min(0).max(1000) }).strict(),
])
export const speechLineSchema = z.object({
  speaker: z.string().trim().min(1).max(12),
  text: z.string().trim().min(1).max(300),
  intent: z.enum(voiceIntents).optional(),
  emotion: z.enum(voiceEmotions).optional(),
  voiceProfile: z.string().regex(/^[a-z][a-z0-9-]{0,31}$/).optional(),
  segmentation: z.enum(['none', 'sentences']).optional(),
  segments: z.array(segment).min(1).max(24).optional(),
  ...overrides,
}).strict().superRefine((line, ctx) => {
  if (!line.segments) return
  if (line.segmentation === 'sentences') ctx.addIssue({ code: 'custom', message: 'Choose explicit segments OR automatic segmentation' })
  for (const segment of line.segments) {
    if (!('text' in segment)) continue
    const occupied = new Set<number>()
    for (const mark of segment.pronunciations ?? []) {
      let start = segment.text.indexOf(mark.text)
      for (let n = 1; n < (mark.occurrence ?? 1) && start >= 0; n++) start = segment.text.indexOf(mark.text, start + 1)
      if (start < 0 || (mark.occurrence === undefined && segment.text.indexOf(mark.text, start + 1) >= 0)) {
        ctx.addIssue({ code: 'custom', message: 'Pronunciation text must occur exactly once in its segment' })
        continue
      }
      for (let i = start; i < start + mark.text.length; i++) {
        if (occupied.has(i)) ctx.addIssue({ code: 'custom', message: 'Pronunciation spans cannot overlap' })
        occupied.add(i)
      }
    }
  }
  if (line.segments.map(s => 'text' in s ? s.text : '').join('') !== line.text)
    ctx.addIssue({ code: 'custom', message: 'Segment text must exactly match subtitle text' })
  if (line.segments.reduce((sum, s) => sum + ('pauseMs' in s ? s.pauseMs : 0), 0) > 3000)
    ctx.addIssue({ code: 'custom', message: 'Total pauses exceed 3000ms' })
})
export type SpeechLine = z.infer<typeof speechLineSchema>
