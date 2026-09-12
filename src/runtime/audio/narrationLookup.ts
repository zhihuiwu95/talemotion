import index from '../../generated/narration-index.json'

/** Build-time source binding only. No voice/emotion decisions in the browser. */
export function narrationClipId(source: string): string {
  return (index.sources as Record<string, string>)[source] ?? `missing:${source}`
}
/** Transitional adapter, exclusively for the original activities and classic demo. */
export function legacyClipId(text: string): string {
  return (index.legacy as Record<string, string>)[text] ?? 'missing:legacy'
}
