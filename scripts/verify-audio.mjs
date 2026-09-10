import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
const input = JSON.parse(readFileSync('scripts/narration-input.json', 'utf8'))
const config = JSON.parse(readFileSync('scripts/tts-config.json', 'utf8'))
const manifest = JSON.parse(
  readFileSync('src/generated/narration.json', 'utf8'),
)
for (const [key, value] of Object.entries(config))
  if (manifest[key] !== value)
    throw new Error(`Stale narration configuration: ${key}`)
for (const line of input) {
  const { text, style, styleDegree, rate, pitch } = line
  const hash = createHash('sha256')
    .update(
      JSON.stringify([
        config.version,
        config.voice,
        config.format,
        text,
        style,
        styleDegree,
        rate,
        pitch,
      ]),
    )
    .digest('hex')
    .slice(0, 20)
  const source = manifest.clips[text]
  if (source !== `audio/${hash}.mp3` || !existsSync(`public/${source}`))
    throw new Error(`Missing or stale audio: ${text}`)
  const data = readFileSync(`public/${source}`)
  if (
    data.length < 1024 ||
    !(
      data.subarray(0, 3).toString() === 'ID3' ||
      (data[0] === 0xff && (data[1] & 0xe0) === 0xe0)
    )
  )
    throw new Error(`Invalid MP3: ${source}`)
  for (const field of ['style', 'styleDegree', 'rate', 'pitch'])
    if (manifest.settings[text]?.[field] !== line[field])
      throw new Error(`Stale audio style: ${text}`)
}
if (Object.keys(manifest.clips).length !== input.length)
  throw new Error('Manifest contains obsolete narration')
console.log(
  `Verified ${input.length} published Azure MP3s, including text and SSML settings`,
)
