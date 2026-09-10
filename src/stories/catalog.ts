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
export const catalogVersion = '1.0'
