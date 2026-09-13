import { voiceIntents, voiceEmotions } from './speech'

/** Versioned capabilities. Story authors reference these IDs; they never supply code. */
export const assets = [
  'bear-cold',
  'bear-warm',
  'bear',
  'fox',
  'cat',
  'rabbit',
  'mitten-stripe',
  'mitten-dot',
  'snow',
  'pine',
  'bird',
  'snowman',
  'footprints',
  'blocks',
  'posts',
  'roof-coral',
  'roof-blue',
  'shelter-coral',
  'shelter-blue',
  'shelter-coral-full',
  'shelter-blue-full',
  'basket',
  'drum',
  'wait',
  'clap',
  'flower',
] as const
export const backdrops = ['snow', 'meadow', 'rain'] as const
export const slots = [
  'actor-left',
  'actor-right',
  'prop-left',
  'prop-center',
  'prop-right',
  'sky-left',
  'sky-right',
] as const
export const motions = [
  'still',
  'arrive',
  'wiggle',
  'celebrate',
  'deliver',
  'build',
  'play',
] as const
export const moods = ['neutral', 'happy'] as const
export const styles = [
  'story',
  'affectionate',
  'cheerful',
  'excited',
  'empathetic',
] as const
export const MIN_BEAT_MS = 1800
// Published protocols are lockstep for now; never resolve authored versions via latest.
const common = { assets, slots, moods, motions, styles, voiceIntents, voiceEmotions }
export const catalogs = {
  '1.0': { ...common, backdrops, soundCues: [] as const },
  '1.1': {
    ...common,
    backdrops: [...backdrops, 'meadow-after-rain'] as const,
    soundCues: ['drum-short', 'drum-clap-short'] as const,
  },
} as const
export const capabilityExport = {
  formatVersion: '2.0',
  latest: '1.1',
  catalogs,
} as const
export type StoryBackdropKind = (typeof catalogs)['1.1']['backdrops'][number]
