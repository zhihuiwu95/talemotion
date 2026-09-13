import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { storySchema } from '../src/stories/schema'
import { verifyAcceptance } from '../src/stories/engine'
import { capabilityExport } from '../src/stories/catalog'
import { z } from 'zod'

const args = process.argv.slice(2)
if (args.includes('--review')) {
  const requested = args.filter((arg) => arg !== '--review')
  const files = requested.length
    ? requested
    : readdirSync('src/stories/packs')
        .filter((file) => file.endsWith('.json'))
        .map((file) => `src/stories/packs/${file}`)
  const output = [
    '# 故事包审阅分镜',
    '',
    '由 `npm run stories:review` 从故事 JSON 生成。表格帮助人工核对，不代表内容质量自动通过。',
    '',
  ]
  for (const file of files) {
    const p = storySchema.parse(
      JSON.parse(readFileSync(file, 'utf8')),
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
        `| ${n.id} · ${n.kind} | ${cell(n.line.speaker + '：' + n.line.text)} (${n.line.emotion ?? n.line.style ?? 'neutral'})<br>文字提示：${cell(n.cue)} | ${n.backdrop}${'soundCue' in n && n.soundCue ? `<br>制作音效：${n.soundCue}` : ''}<br>${n.entities.map((e) => `${e.asset}@${e.slot}/${e.motion}`).join('<br>')} | ${n.interaction ? n.interaction.choices.map((c) => `${cell(c.label)} → ${c.next}：${cell(c.consequence)}`).join('<br>') : n.next ? `演出结束 → ${n.next}` : '主动结束／重玩'} |`,
      )
    output.push('', '### 选择前后的实际差异', '',
      '只比较 JSON 快照；动效执行、空间含义和双方同意仍需审阅。无位置变化不一定是错误，不能用动效自动证明协商成立。', '',
      '| 选择 | 实际目标 / 口头提示 | 下一幕状态差异 | 作者承诺 |',
      '|---|---|---|---|')
    for (const n of p.nodes) {
      for (const c of n.interaction?.choices ?? []) {
        const next = p.nodes.find((node) => node.id === c.next)!
        const changes: string[] = []
        if (n.backdrop !== next.backdrop)
          changes.push(`背景 ${n.backdrop} → ${next.backdrop}`)
        for (const entity of next.entities) {
          const before = n.entities.find((e) => e.id === entity.id)
          if (!before) changes.push(`新增 ${entity.id}: ${entity.asset}@${entity.slot}`)
          else for (const key of ['asset', 'slot', 'mood', 'motion'] as const)
            if (before[key] !== entity[key])
              changes.push(`${entity.id}.${key}: ${before[key]} → ${entity[key]}`)
        }
        for (const entity of n.entities)
          if (!next.entities.some((e) => e.id === entity.id))
            changes.push(`移除 ${entity.id}`)
        const target = n.entities.find((e) => e.id === c.target)!
        output.push(`| ${n.id}/${c.id} → ${next.id} | ${target.asset}@${target.slot}<br>口头：${cell(n.line.text)}<br>文字标签：${cell(c.label)} | ${changes.join('<br>') || '实体和背景属性无变化'} | ${cell(c.consequence)} |`)
      }
    }
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
  if (requested.length) console.log(output.join('\n'))
  else {
    writeFileSync('docs/production/SAMPLE_STORYBOARDS.md', output.join('\n') + '\n')
    console.log('Exported review storyboards from current JSON.')
  }
} else if (args.includes('--export')) {
  writeFileSync(
    'docs/production/story.schema.json',
    JSON.stringify(z.toJSONSchema(storySchema), null, 2) + '\n',
  )
  writeFileSync(
    'docs/production/capabilities.json',
    JSON.stringify(
      capabilityExport,
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
