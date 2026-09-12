// Keep the established entrypoint; Python owns generation and cache semantics.
import { spawnSync } from 'node:child_process'
const result = spawnSync('.venv/bin/python', ['scripts/verify_audio.py'], { stdio: 'inherit' })
if (result.error) throw result.error
process.exit(result.status ?? 1)
