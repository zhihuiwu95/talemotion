# 花园完整故事版：实施计划

REQ-GARDEN-EXPANDED；Plan v0.3，2026-09-13；依据 [架构 v0.3](arch.md)、[Design v0.2](design.md)、[PRD v0.3](prd.md)。本轮核对基线 `27415c5`，开始时工作区干净。

状态：E1～E3 已获用户确认；按最新授权连续执行 E4～E6。E4/E5 及 E6 本地工程与浏览器验收已完成；实机/人工体验待确认；最终结果见 REVIEW_REPORT.md。下表及旧阶段 Gate 保留为原计划记录，执行以文末最新授权为准。

## 1. 执行顺序与确认点

| 步骤 | 可检查交付 | 完成后等待用户确认 |
|---|---|---|
| E1 声音与构图试样 | 少量候选声音、L0/L1/LF/LG 四布局样稿、A/B 决策记录 | 确认构图与声音方向，再进入 E2 |
| E2 版本契约与目录导出 | 显式 1.0/1.1 schema、能力目录 v2、兼容和边界测试 | 确认后进入 E3 |
| E3 背景与故事实现 | 新背景、34 节点 JSON、四条路径、内容与发音审阅 | 确认内容后进入 E4 |
| E4 制作与发布隔离 | 人声/产物身份、限定发布、条件混音管线、离线回归证据 | 确认声音管线与发布范围后进入 E5 |
| E5 正式声音与工程验收 | 本篇正式音频、一次 quality、文件/构建规模和差异记录 | 确认工程交付后进入 E6 |
| E6 本地预览与体验验收 | 实际访问入口、视觉/听感记录、未验证项 | 用户查看后决定修改或交付 |

步骤内连续完成必要读文件、编辑、相关测试；不为每条命令增加确认。步骤间不自动推进。E1 若 A 不足，先呈现具体片段，请用户确认是否制作 B 对照片段；不把试听 A 当成批准 B。任何阶段发现需求/体验方案需要实质改动，先说明差异。

不提交、推送或部署，不删除历史音频。涉及 computer use 时遵循项目要求，说明具体用途并获得明确确认；Plan 确认不自动替代该确认。

## 2. E1：音乐候选与空间样稿

### 工作

- 复核 Git 与本地采样工具；读取必要配置但不输出密钥。使用既有环境与非发布流程，不安装新工具或采购素材。
- 为 x04c/x06c/x04d/x06d 准备候选台词，逐句检查多音字、数字声调和人声文本；样稿审阅记录独立，不伪装成已入库正式台词。
- 先生成 A 纯语音节奏。既有 audio:sample 的采集行为不应污染正式索引；必要时用隔离输入/输出的小采样入口，复用声音导演与配置，不注册未获契约支持的新故事。生成前后比较正式 manifest/index/playback 文件哈希。
- A 若不足，在用户确认后制作 B 样稿：检查本地混音工具、登记合法素材、保留原始语音、输出短 cue+对白候选。没有适合工具/素材时报告具体缺口，不用模糊声音占位假装完成。
- 绘制 L0/L1/LF/LG 静态 SVG 构图，优先复用已有角色和物体造型。花丛向中槽延伸，水洼避开摆放区，四布局保留真实物体比例。不是播放器实现或实机触控证明。

### 完成条件

- 有真实可听的候选与可看的四布局样稿；中槽靠花、右槽更靠花，无文字辩解。
- 记录用户选择 A/B 及声音可辨认性；不以生成成功代替试听。
- 正式声音与旧故事文件无变化；拟定样稿目录 `docs/requirements/garden-gathering-expanded/samples/`，新增证据在 `validation.md` 记录为试样。

## 3. E2：明确版本契约和公开导出

### 变更范围

`src/stories/schema.ts`、`catalog.ts`、`scripts/validate-stories.ts`、对应测试、生成的 `docs/production/story.schema.json` / `capabilities.json`，以及生产 README、CAPABILITIES、AUTHOR_PROMPT、STORY_STANDARD 的受影响说明。

- 明确 storyV1Schema / storyV1_1Schema；公共字段可复用，版本 literal、枚举与 max 写在分支。优先判别联合；如当前导出器不支持则用显式联合，不能退回 superset+散落 refine。
- 保持锁步 1.0/1.0 与 1.1/1.1；旧版 4～24、interactive 起点，新版 4～40、interactive/beat 起点。跨节点起点引用和图语义仍统一检查。
- 导出 formatVersion=2.0、latest=1.1、catalogs 的完整目录；字段、空 soundCues 与条件注册严格按 arch 2.1。latest 不参与覆盖故事版本。
- B 入选才增加 1.1 soundCue 字段与注册 ID；1.0 不允许该字段。此步只声明能力，尚未将新包加入 eager library；运行时实现紧接 E3，不把 E2 单独发布为完成产品。

### 完成条件

- 有效图证明 1.0：24 通过/25 拒绝；1.1：40 通过/41 拒绝。
- 旧四包通过；未知或混合版本、1.0 新背景/beat 起点/声音字段拒绝；1.1 ending 起点及自动循环拒绝。
- JSON Schema 导出保留版本限制；导出目录与源清单一致。`npm run stories:export` 后复核差异。
- 仓内目录消费者和制作说明同步；不声称外部使用者已迁移。保留现有反例，不为通过新包放宽图规则。

E2 确认后，Story 1.1、Catalog 1.1 与公开目录格式在本需求内冻结。后续新增/删除字段、能力 ID 或改变版本/上限/起点语义，停止依赖该变化的工作并返回 E2 确认；A→B 先补声音决策，再回 E2。既有能力内台词和布局修订仍在对应阶段审阅。

## 4. E3：背景、完整故事与内容审阅

### 变更范围

`StoryArt.tsx`、局部 `stories.css`、新 `src/stories/packs/garden-gathering-party.json`、播放器/路径测试、`scripts/pronunciation-review.json` 及内容记录。旧包不改写。

- 按 E1 构图实现 meadow-after-rain，检查舞台和故事卡调用；不整体改变旧背景或槽位。
- 完成 34 节点、四条路径；两种布局各自持续，拍手操作 target=fox；成果、尾声、主要告别均在 ending 之前。
- 修正现有播放器测试中的固定 settle 和重玩假设，使用有限逐节点推进。另验证点击开始前无声音、重玩瞬间回 start、自动开场后到 s04、暂停和过期回调不越幕。
- 每条必要操作有可听提示；全台词按最终语境标注读音。B 入选时明确 cue 前缀与人声台词，避免重复节奏和字幕不一致。
- 执行单篇 validate、review、audio:pronunciation 及受影响目标测试；此时正式音频可能缺失，不运行或冒称完整 quality 已绿。

E3 generated 边界：audio:pronunciation 先调用 audio:collect；允许 scripts/narration-input.json 与 src/generated/narration-index.json 包含新故事，src/generated/narration.json 不发布。narration-playback.json 可以被重新写出，但内容只能投影当前正式 manifest，不伪造新音频映射。完整 audio:verify 因新台词未发布而暂未通过属于阶段状态，不放宽验证；E5 发布后 collect 才取得新映射。

### 完成条件

- 四组合覆盖全部节点/选择，每条 18 节点、4 次有效点击；逐步检查篮子持续位置与中间鼓。
- 台词、操作、实际画面证据对应 AC-01～10；内容问题修复后再交付。
- 新包未生成正式音频的范围清楚列出。收集工具产生的正式投影与输入变更单列，不覆盖历史记录。

## 5. E4：声音身份、缓存与限定发布

### 变更范围

`collect-narration.ts`、`generate-audio.py`、`scripts/verify_audio.py`（实际校验逻辑，`scripts/verify-audio.mjs` 为命令入口）、相关测试；按需新增制作端混音模块和 sound-cues 注册元数据。保持播放器单音频元素与现有生命周期。

### 所有方案必做

- 保留 source→Narration Line ID；最终文件只由已发布产物记录决定。
- 实现按 source 前缀限定本篇发布。拟定入口 `npm run audio:generate -- --publish --source-prefix pack:garden-gathering-party:`；参数尚不存在，完成实现与测试前不得直接执行或回退全量发布。
- 保留旧 source 对应声音路径、文件哈希和实际生成证据。只保留旧文件不够，正式绑定也须不变。
- A 保持 manifest v2，只实现 source-prefix 限定发布、合并与原子替换；B 才引入 v3 的 speech/output 与混音缓存。A 若遇明确阻断，先回架构评审，不自行升级。B 显式支持 v2/v3 验证与迁移，不能重贴旧录音标签。
- 发布临时结果全部验证后替换正式 manifest；任何生成/验证失败保持正式清单不变。collect 从正式 manifest 重建 playback，不能还原原始语音绑定。

### B 入选时追加

- Raw Speech 与 Composite 分开存为不可覆盖的哈希文件；复用语音合成缓存。
- compositeId 纳入 speech 文件哈希、cue 文件哈希、规范化 mixParameters、mixVersion；有限 cue 注册，不接受任意资源路径或时间轴。
- 验证音量修改不调用 Azure 合成、文件变化触发重新混音；缺失 cue/失效缓存/不合法素材终止制作；候选永不写正式索引。
- 保证单条最终音频播放完毕才释放正常推进；音频时长低于现有故障上限。无需新增运行时声音状态机。

### 完成条件

离线测试证明：发布混音后再次 collect 保持 composite；修改音量只重混；仅新故事条目变化；失败无部分发布；旧录音路径与证据不变；缺失/篡改 output 和过期依赖被拒绝。此步骤不调用正式发布，交付管线与验证证据后等待用户确认。

## 6. E5：正式声音与工程验收

前提：E3 内容、读音及 E4 范围隔离已确认。

- 使用已实现的限定发布入口，只生成/发布本篇，保留原人声、候选和旧故事录音。
- 再运行 audio:collect，验证播放映射稳定；执行一次 `npm run quality`。失败则修复相关部分，存在新修改才重跑必要检查。
- 按需更新全量生成分镜；核对所有生成文件副作用、旧 source 映射、旧包和历史资源没有意外变化。
- 记录 JSON raw/gzip、入口 JS 增量、音频总量及单篇/全量校验耗时；34/40 节点样本在边界测试中顺带记录。仅作规模说明，不建立性能优化任务、不优化图算法、不用偶然耗时差做性能结论。

完成条件：本篇正式音频与索引一致、完整 quality 结果明确、旧声音绑定保持、`git diff --check` 通过；真实播放与家庭体验仍独立待验证。

## 7. E6：本地预览与体验验收

- 启动 `npm run dev -- --host 0.0.0.0`，用终端实际端口检查本地 `/?story=garden-gathering-party`，交付真实入口。localhost 可访问不等于手机局域网可达。
- 核对四布局在 320/375/430px 的花/篮子邻接、遮挡、目标热区、字幕和结束入口；拍手/敲鼓有实际反馈，尾声后才出现结束区。
- 需要 computer use 时单独说明用途并获确认；未执行写待验证。实际手机的媒体许可、扬声器听感、操作发现性与家庭观察分开记录。
- 请用户比较新版完整感，记录是否仍突然结束，不以工程绿灯替代体验判断。

交付本地版本与 `validation.md`：AC 对应证据、用户反馈、未测项、修改建议。到此仍无提交/推送/部署授权。

## 8. 风险与回退

- A/B 试听、构图的判断依赖用户反馈；不得用超时默认通过。
- 缺失密钥、混音工具或素材只阻塞相关分支，可继续不依赖它的已授权工作，不读取完整 shell 配置。
- 34 节点是当前分镜统计；若修改必须重新核对四条路径，不靠删除尾声卡上限。
- Runtime、Schema、Catalog、Story Pack、生成文件和音频作为同一静态构建单元交付/回退；不能单退 schema 留下 1.1 包阻断 eager library。
- 每步开始与结束核对 Git，保留外部改动；不自行回退他人提交。

## 9. 本轮 Plan 验证

已静态核对公开导出、音频 source/index/playback、原始语音校验与全量 publish 行为。计划对应现有命令与拟定接口均有区分。只更新架构与计划文档，未运行生成、产品测试或服务，未生成任何样稿。用户已确认开始 E1，本轮只执行 E1；下一步仍需确认。

## Latest execution authorization

User confirmed E3 and explicitly authorized continuous E4–E6, including scoped production publication and local acceptance, overriding the earlier per-stage waits. FFmpeg installation was explicitly approved as a local production-only tool; no browser dependency or committed binary. Only frozen-contract/product changes, new unapproved resources, or unapproved commit/push/deploy/deletion require stopping.
