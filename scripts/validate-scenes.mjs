import { access, readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseScene } from '../src/schema/scene.ts'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const sceneDirectory = join(projectRoot, 'src', 'demo')
const sceneFiles = (await readdir(sceneDirectory))
  .filter((file) => file.endsWith('.scene.json'))
  .sort()

if (sceneFiles.length === 0) {
  console.error('未找到 src/demo/*.scene.json 场景文件。')
  process.exitCode = 1
} else {
  let failures = 0

  for (const file of sceneFiles) {
    try {
      const input = JSON.parse(await readFile(join(sceneDirectory, file), 'utf8'))
      const scene = parseScene(input)
      await validateLocalAssets(scene.assets)
      console.log(
        '✓ ' + file + ' | ' + formatDuration(scene.duration) + ' | ' +
          scene.objects.length + ' 个对象 | ' + scene.timeline.length + ' 个动作',
      )
    } catch (error) {
      failures += 1
      console.error('✗ ' + file)
      if (error && typeof error === 'object' && 'issues' in error) {
        for (const issue of error.issues) {
          console.error('  ' + (issue.path.join('.') || 'scene') + ': ' + issue.message)
        }
      } else {
        console.error('  ' + (error instanceof Error ? error.message : String(error)))
      }
    }
  }

  if (failures > 0) process.exitCode = 1
}

async function validateLocalAssets(assets) {
  for (const [assetId, source] of Object.entries(assets)) {
    if (!source.startsWith('/')) continue
    const assetPath = join(projectRoot, 'public', source.replace(/^\/+/, ''))
    try {
      await access(assetPath)
    } catch {
      throw new Error('本地素材不存在：' + assetId + ' -> ' + source)
    }
  }
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.round(seconds % 60)
  return minutes.toString().padStart(2, '0') + ':' + remainder.toString().padStart(2, '0')
}
