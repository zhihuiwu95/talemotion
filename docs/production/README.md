# TaleMotion 故事生产工具包 v1.1

更新：2026-09-11。三个样板和第四篇已通过工程校验；第四篇已完成两轮内容修订，但没有获认可的内容评分，修订版视觉/播放、实机和家庭试玩仍待验证。成本优势与儿童学习效果尚未验证。先看[第四篇复审](runs/fourth-story-review.md)和[修订记录](runs/fourth-story-revision.md)；原首次制作记录保留，v1.1 改进用于后续制作。

## 从哪里开始

| 使用者 | 入口 |
|---|---|
| 想先试玩 | `/?story=snow-mittens`、`/?story=rain-shelter`、`/?story=little-drum`；已本地工程验证、待内容/实机确认的第四篇 `/?story=garden-gathering` |
| 想了解制作流程 | [生产规范](STORY_STANDARD.md) |
| 要让其他模型开始制作 | [可直接使用的任务提示](AUTHOR_PROMPT.md) + [第四个故事任务书](FOURTH_STORY_BRIEF.md) |
| 想知道能画什么、怎么动 | [能力说明](CAPABILITIES.md) + [机器可读能力目录](capabilities.json) |
| 要检查数据格式 | [JSON Schema](story.schema.json) + `src/stories/schema.ts` 的语义检查 |
| 要审看当前故事包 | [从 JSON 导出的分镜表](SAMPLE_STORYBOARDS.md) |
| 要判断是否合格、省钱 | [验收规则与记录模板](EVALUATION.md) |
| 要看做到了哪里 | [前三篇历史验证](VALIDATION.md) + [第四篇复审](runs/fourth-story-review.md) + [第四篇修订记录](runs/fourth-story-revision.md) |

## 一条最短制作路径

1. 阅读任务书、规范、能力说明与一个相关合格样板，写简短目标和梗概；按需查其他样板。
2. 制作 JSON，运行 `npm run stories:validate -- src/stories/packs/<id>.json`。
3. 运行 `npm run stories:review -- src/stories/packs/<id>.json`，只输出本篇分镜和实际前后差异。逐项审天气、双方同意、口头操作提示和真实后果，不只看总分。
4. 先修内容，按[生产规范](STORY_STANDARD.md)逐句审阅多音字、标明拼音声调并更新发音审阅表；运行 `npm run audio:pronunciation`，再运行 `npm run audio:generate -- --publish` 与一次 `npm run quality`；缓存复用已有音频。
5. 纯 JSON 复用既有能力默认不使用 computer use。按[分层验收](EVALUATION.md)记录已完成和待预览维度，有具体布局、资产或播放风险才针对性检查。
6. 写一份结果记录，区分作者自查、额外审阅、成本来源和家庭试玩。完整分镜由 JSON 导出，不重复手写。

无需修改首页注册列表、播放器、语音采集器、测试列表。它们自动发现 `src/stories/packs/*.json`。开发时新增文件由 Vite 发现，生产构建打包静态内容；不是线上上传系统，也不在儿童游玩时调用模型。

## 本轮的三个样板

| 故事 | 主要目标与差异 | 结构覆盖 |
|---|---|---|
| 雪松下的小手套 | 观察相同花纹，帮助小熊 | 可选探索、描述性重试、感谢后自由选结尾 |
| 一起搭个小雨棚 | 用玩具搭建体验顺序与共同完成 | 支架→棚顶→移入篮子；两种颜色都成立 |
| 小鼓咚咚响 | 听到双方愿望，共同商量玩法 | 自愿轮流或拍手加入；没有社交题目的标准答案 |

原活动 `mittens/picnic/hide/garden`、第一版 `mittens-story` 和经典动画入口继续保留。样板之间长度和操作不同，不能直接比较完成时间推断教育优劣。

## 范围

v1 支持有限的 SVG/CSS 绘本演出、点击选择、静态分支、固定中文配音。新素材、新交互和更复杂演出需要独立扩展能力。还没有通用视频生成、自由对话、在线故事上传、动态变量脚本或内容管理后台。
