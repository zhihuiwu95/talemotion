import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { storySchema } from '../src/stories/schema'
import { verifyAcceptance } from '../src/stories/engine'
import {
  assets,
  backdrops,
  catalogVersion,
  moods,
  motions,
  slots,
  styles,
} from '../src/stories/catalog'
import { z } from 'zod'

const args = process.argv.slice(2)
if (args.includes('--review')) {
  const files = readdirSync('src/stories/packs').filter((file) =>
    file.endsWith('.json'),
  )
  const output = [
    '# 三种故事样板的审阅分镜',
    '',
    '由 `npm run stories:review` 从故事 JSON 生成。表格帮助人工核对，不代表内容质量自动通过。',
    '',
  ]
  for (const file of files) {
    const p = storySchema.parse(
      JSON.parse(readFileSync(`src/stories/packs/${file}`, 'utf8')),
    )
    output.push(
      `## ${p.title} (${p.id})`,
      '',
      `目标：${p.learning.objective}`,
      '',
      `依据：${p.learning.evidenceIds.join('、')}。${p.learning.limitation}`,
      '',
      `观察：${p.learning.observation}`,
      '',
      '| 节点 | 台词与情绪 | 场景对象 | 孩子动作与后果 |',
      '|---|---|---|---|',
    )
    const cell = (value: string) =>
      value.replaceAll('|', '／').replaceAll('\n', ' ')
    for (const n of p.nodes)
      output.push(
        `| ${n.id} · ${n.kind} | ${cell(n.line.speaker + '：' + n.line.text)} (${n.line.style}) | ${n.entities.map((e) => `${e.asset}@${e.slot}/${e.motion}`).join('<br>')} | ${n.interaction ? n.interaction.choices.map((c) => `${cell(c.label)} → ${c.next}：${cell(c.consequence)}`).join('<br>') : n.next ? `演出结束 → ${n.next}` : '主动结束／重玩'} |`,
      )
    output.push(
      '',
      '验收路径：',
      ...p.acceptance.map(
        (test) =>
          `- ${test.name}：${test.choices.join(' → ')} → ${test.ending}`,
      ),
      '',
    )
  }
  writeFileSync(
    'docs/production/SAMPLE_STORYBOARDS.md',
    output.join('\n') + '\n',
  )
  console.log('Exported review storyboards from current JSON.')
} else if (args.includes('--export')) {
  writeFileSync(
    'docs/production/story.schema.json',
    JSON.stringify(z.toJSONSchema(storySchema), null, 2) + '\n',
  )
  writeFileSync(
    'docs/production/capabilities.json',
    JSON.stringify(
      { catalogVersion, assets, backdrops, slots, moods, motions, styles },
      null,
      2,
    ) + '\n',
  )
  console.log(
    'Exported schema and capability IDs. Semantic graph checks remain in stories:validate.',
  )
} else {
  const files = args.length
    ? args
    : readdirSync('src/stories/packs')
        .filter((file) => file.endsWith('.json'))
        .map((file) => `src/stories/packs/${file}`)
  const ids = new Set<string>()
  let failures = 0
  for (const file of files) {
    try {
      const result = storySchema.safeParse(
        JSON.parse(readFileSync(file, 'utf8')),
      )
      if (!result.success)
        throw new Error(
          result.error.issues
            .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
            .join('\n'),
        )
      const pack = result.data
      if (ids.has(pack.id)) throw new Error(`Duplicate story ID ${pack.id}`)
      ids.add(pack.id)
      const errors = verifyAcceptance(pack)
      if (errors.length) throw new Error(errors.join('\n'))
      console.log(
        `PASS ${pack.id}: ${pack.nodes.length} nodes, ${pack.acceptance.length} paths, all nodes/choices covered; content review still required`,
      )
    } catch (error) {
      failures++
      console.error(
        `FAIL ${file}\n${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
  if (!files.length) {
    console.error('No story packs found')
    failures++
  }
  process.exitCode = failures ? 1 : 0
}
