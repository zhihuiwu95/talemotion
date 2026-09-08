import { readFileSync, statSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
const input = JSON.parse(readFileSync('scripts/narration-input.json', 'utf8'))
const manifest = JSON.parse(
  readFileSync('src/generated/narration.json', 'utf8'),
)
for (const text of input) {
  const source = manifest.clips[text]
  const hash = createHash('sha256')
    .update(`${manifest.voice}|${manifest.rate}|${manifest.pitch}|${text}`)
    .digest('hex')
    .slice(0, 20)
  if (
    source !== `audio/${hash}.mp3` ||
    !existsSync(`public/${source}`) ||
    statSync(`public/${source}`).size < 1024
  )
    throw new Error(`Missing or stale audio: ${text}`)
}
console.log(`Verified ${input.length} published Edge TTS clips`)
