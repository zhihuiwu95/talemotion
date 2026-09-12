# Review Report：Azure Speaker-aware Voice Pipeline

2026-09-12 · 起点 commit `6284088` · 当前为未提交工作区。
当前结论：小熊③已正式采用；全量 104 条台词完成多音字/轻声语境审阅，97 条保存共 381 处显式读音，7 条记录无需额外标注。已按最新标注切换正式录音，quality 通过；未使用 computer use，未提交/推送/部署。下面保留阶段历史，当前结果见末尾全量发音审阅记录。

## 1. 原问题与证据

- `collect-narration.ts` 原 `Map` 以 text 为 key，保留 text/style/degree/rate/pitch，却丢失 speaker；同文异 style 报错。同句不同角色无法有独立录音身份。
- `tts-config.json` 原只有 `zh-CN-XiaoxiaoMultilingualNeural`。角色名字只进入字幕，不改变音色。
- 原 prosody 全部 -5%、+0Hz；degree 只有 1.0 与 excited=1.1，表达差异仅靠整句 style。
- `generate-audio.py` 原一整句只有一个 express-as/prosody，缺少句内停顿和情绪层次。
- manifest 原 text→src，`EdgeAudioProvider.speak({text})` 同样按文字寻找录音。问题涉及采集、建模、缓存和播放，不是单个 styleDegree 数值。
- Review 读取了用户列出的脚本、完整配置/清单、两种旧入口的数据、schema、四个当前故事包以及 TTS_DECISION；使用当前代码而非旧文档推断。

## 2. 修改内容

| 文件 | 关键变化 |
|---|---|
| `docs/requirements/speaker-aware-tts/prd.md`、`design.md`、`arch.md`、`PLAN.md` | AC-01～10，制作/试听/正式发布分阶段，实施追踪 |
| `src/stories/speech.ts`、`src/stories/schema.ts` | speaker、intent、emotion、profile、prosody、segment 的结构约束；旧包兼容；字幕与段落一致性 |
| `scripts/narration.ts`、`scripts/collect-narration.ts` | 来源+方向摘要 ID；保留 speaker；旧 style→emotion；生成来源索引和精简播放投影 |
| `scripts/tts-config.json`、`scripts/azure-voices.snapshot.json` | 4 profiles、角色别名、intent/emotion preset、profile override、实时能力快照 |
| `scripts/voice_director.py` | 确定性 resolver、style fallback、XML escape、受限 SSML、opt-in 分句、hash |
| `scripts/generate-audio.py` | 一次性 metadata-only 桥接；显式 --publish；完整成功后原子发布；MP3+SHA256 缓存；有限重试 |
| `scripts/tts-legacy-manifest.json` | 冻结 v1 正式参数，供兼容审计及 A 样本复用 |
| `scripts/sample-audio.py` | 8×3 独立样本、逐条参数/SSML、README、共享播放器 HTML；A 复用原波形 |
| `scripts/verify-audio.mjs`、`scripts/verify_audio.py` | 单一 Python 语义验证 generation/hash/字节和 legacy 状态，检查播放投影 |
| `src/generated/narration.json`、`narration-index.json`、`narration-playback.json` | 104 个身份→完整记录；来源→ID；ID→src。正式引用仍对应原 102 MP3 |
| `SpeechProvider.ts`、`EdgeAudioProvider.ts`、`narrationLookup.ts`（`src/runtime/audio/`） | id 优先播放；缺失 id 不按 text 偷换音频；浏览器不解释声音参数 |
| `src/stories/PackPlayer.tsx`、`src/play/MittenAdventurePlayer.tsx`、`adventureStory.ts` | 故事/第一版手套按编译来源取得 clipId |
| `src/play/ActivityPlayer.tsx`、`MatchingStory.tsx`、`src/runtime/audio/AudioManager.ts` | 旧活动/经典动画经限定兼容索引显式传 ID |
| `scripts/narration.test.ts`、`scripts/test_voice_director.py`、`EdgeAudioProvider.test.ts`、`AudioManager.test.ts` | 身份冲突、resolver、SSML/注入、缓存损坏、manifest、失败不发布、ID 优先/生命周期测试 |
| `scripts/validate-stories.ts`、`docs/production/story.schema.json`、`capabilities.json` | 同步新契约、intent/emotion 导出与旧 style 的审阅显示 |
| `docs/TTS_DECISION.md`、`docs/production/STORY_STANDARD.md`、`CAPABILITIES.md` | 当前声线与契约、兼容状态、命令、秘密边界 |
| `docs/sdd/design.md`、`arch.md` | 添加旧 speaker/text-only 描述被本需求取代的注明，保留 v1.0 引用背景 |
| `package.json`、`.gitignore` | audio:sample、Python 测试、dev/build 前刷新投影、忽略 tmp |

本任务前已有 `AGENTS.md`、根 README 和 docs/sdd 未提交内容，保留；不把它们全算作本次新改动。`src/stories/packs/*.json`、`public/audio/`、package-lock、历史运行记录未改；未新增依赖。

运行时精简投影使最终主 JS 为 **420.45 kB / gzip 126.71 kB**。开发过程中直接导入完整 production metadata 时为 583.99 kB；已移除该额外负担。此比较是本轮中间实现与最终实现，不是与原 commit 的基准比较。经典入口仍懒加载。

## 3. 当前 Voice Profiles

真实查询 eastus 中文 Neural Voice；4 个 voice 均返回存在并已用于 B/C 合成。默认参数不是最终情绪解析结果。

| speaker | Azure voice | default style | default prosody / degree |
|---|---|---|---|
| narrator / 旁白 | zh-CN-XiaoxiaoMultilingualNeural | story | -8%、+0Hz、1.0 |
| duoduo / 朵朵 / 朵朵警官 | zh-CN-XiaoyiNeural | cheerful | -1%、+1Hz、1.0 |
| bear / 小熊 | zh-CN-YunxiNeural | narration-relaxed | -6%、-3Hz、1.0 |
| fox / 小狐狸 | zh-CN-XiaohanNeural | cheerful | +1%、+1Hz、1.0 |
| cat / 小猫，rabbit / 小兔 | zh-CN-XiaoyiNeural（复用 duoduo） | cheerful | -1%、+1Hz、1.0 |

实际例：小熊 warm 使用 narration-relaxed、degree 1.1、rate -8%、pitch -3Hz；excited 使用 cheerful、degree 1.35、rate +5%、pitch +0Hz。不支持的表达优先用已登记 styleMap；仍不支持则去掉 express-as，保留该 voice+prosody，并记录 warning。没有为 style 把小熊换回 Xiaoxiao。

## 4. A/B/C 样本

本地根目录：`/Users/zhihui/Project/talemotion/tmp/tts-samples/`。

- [试听页](../../../tmp/tts-samples/index.html)；[完整参数 README](../../../tmp/tts-samples/README.md)。
- `A-current/`：8 个原正式波形副本，逐字节一致；不是用新代码重生成的近似 A。
- `B-speaker-aware/`：8 个 profile + intent/emotion 样本。
- `C-speaker-aware-segmented/`：同 8 个候选增加确定性分句/停顿，保持 emotion 相同以隔离节奏变量。
- 每组都有 `01-narrator-story.mp3`、`02-duoduo-prompt.mp3`、`03-duoduo-curious.mp3`、`04-duoduo-excited.mp3`、`05-bear-warm.mp3`、`06-bear-excited.mp3`、`07-duoduo-empathetic-hint.mp3`、`08-fox-warm-ending.mp3`。
- 每条有同名 JSON 与 SSML，合计清单 `manifest.json`；能力列表 `voices-eastus.json`；音频解析 `audio-validation.json`；命令日志 `sample-run.log`、`quality.log`。

共 24 MP3；B/C 实际候选 16 段，文本计数 366 字符（不是 Azure 账单字符口径）。后续重跑同参数验证了缓存复用；未查询账单，费用未知。样本 ID 24 个互不重复，全部字节摘要验证一致。

开发预览本次实际端口 5174：`http://localhost:5174/tmp/tts-samples/index.html`；5173 原有进程未动。也可直接在本机 Chrome 打开本地 HTML。tmp 不进入正式构建或 Git。

## 5. 验证结果

| 检查 | 结果与实际证据 |
|---|---|
| `npm test` | PASS：16 个 Vitest 文件、67 个测试；11 个 Python unittest |
| `npm run lint` | PASS，无报错 |
| `npm run build` | PASS：TypeScript + Vite；最终无 500 kB chunk 警告 |
| `npm run quality` | PASS：scene、4 stories、audio verify、tests、lint、build 完整链路，日志 tmp/tts-samples/quality.log |
| 音频 manifest | PASS：104 clip 身份/参数/字节与原 102 文件对应；均 legacy-retained |
| 样本文件 | PASS：24 个 MP3 通过 macOS afinfo，时长 3.96～12.00s；SHA256 全部一致 |
| 正式浏览器路径 | 雪手套起点播放 a9382cf8f1366c598be3.mp3，5.808s；解锁后进入小熊，播放 d984ba54ec9c31267c72.mp3，4.848s；暂停后 src 清除、paused=true |
| 候选浏览器路径 | Chrome 中 B 朵朵 curious duration=4.896s、currentTime 增长；切到 C 小熊 excited duration=6.264s、currentTime 增长，随后 ended=true、currentTime=6.264s，无 media error；共享一个 audio |
| 静态安全/范围 | public/audio、故事包、锁文件无 diff；密钥仅环境读取；没有把 key 加到配置/manifest/前端；git diff --check |

首轮发现旧 AudioManager 测试断言缺少新增 id，已更新契约并回归。内置浏览器在媒体检查期间两次出现页面崩溃；改用 Chrome 完成候选播放检查。未查明内置浏览器崩溃根因，不归因于 Azure 音频，也不宣称已修复。试听页面最终使用一个共享 audio，避免并发播放。

AC-01～09 的本轮工程/样本交付完成；AC-10 人工盲听待验收。未进行 iOS/Android/微信或亲子试听；没有自动推断“闭眼可辨角色”。

## 6. 剩余限制和下一步

- 候选 voice 是不同声线，不能据此认定儿童年龄感真实、温柔或不刺耳。小熊男声可能偏成熟；小猫/小兔仍复用朵朵 profile。
- 同一 voice 支持的 style 有限；excited→cheerful 依赖 degree/prosody 补充，强度不是听感线性保证。缺失风格的 prosody-only fallback 表达上限须听。
- C 只按标点加停顿，没有真人语义导演、自动重点词重音或 AI 情绪判断。显式 segment 可调局部节奏/情绪，但不能自动保证自然度。
- 当前静态正式声音仍是旧 Xiaoxiao；本轮没有批量重录、没有发布任何候选到产品。后续先试听选定 profile/preset/segmentation，再显式 `npm run audio:generate -- --publish`，然后 quality 与实机检查。
- 完整 canonical manifest 原子发布；播放投影在 collect/dev/build 再生成。正式制作后必须重新构建，不应直接把开发中间文件作为发布产物。
- Qwen3-TTS 未引入；只有 Azure 本轮样本与后续有限调参仍无法满足角色辨识/自然度时，才值得另立需求评估。当前没有为此加 Server/GPU/Agent 框架。

交付状态：代码/文档/样本本地完成；人工试听待进行；未提交、推送、合并、部署。

## 2026-09-12 试听反馈增补：少（shǎo）

用户报告《雪地找手套》“小熊少了一只手套。点点它，问问怎么啦？”的“少”听成四声。定位到朵朵台词；本轮增加 segment.pronunciations 局部标注，由 Builder 在原 prosody 内生成固定 sapi 的 phoneme。字幕、正式故事输入和旧 MP3 保留不动。

新增/修改 src/stories/speech.ts、scripts/voice_director.py、scripts/narration.test.ts、scripts/test_voice_director.py、scripts/sample-pronunciation.py、package.json；同步 SDD 实例、TTS_DECISION 和导出 schema。标注经过唯一匹配/不重叠/字段和格式校验，保留在身份与生成摘要中，不做全局单字替换。

真实 Azure 样本位于 tmp/tts-samples/pronunciation：A-original（旧音频副本）、B-unmarked（新朵朵无标注）、C-shao3（同参数，仅标注少）。B/C 除发音标注外声线、情绪及 prosody 参数一致，文件摘要已校验。首次紧连音调数字的 SSML 请求被服务拒绝 HTTP 400，按官方 SAPI 格式改为 shao 3 后合成成功；错误无敏感内容。C MP3 已通过系统音频解析。

完整 npm run quality 成功：68 个 TS 测试、12 个 Python 测试，lint/build 通过；日志 tmp/tts-samples/pronunciation-quality.log。生成成功不等于读音听感验收，等用户试听；小熊跨情绪声线一致性仍待独立对照。未批量替换正式音频、提交、推送或部署。

## Bear identity audition follow-up

Added scripts/sample-bear.py and audio:sample:bear. Four identical-text Yunxi samples: 01 warm (narration-relaxed, 1.1, -8%, -3Hz); 02 previous excited (cheerful, 1.35, +5%, +0Hz); 03 stable style (narration-relaxed, 1.1, -2%, -3Hz); 04 light cheerful (cheerful, 1.1, -2%, -3Hz). No added segmentation. 01/03 differ only in resolved rate; 03/04 only in style. 02 reuses the verified previous waveform; three new Azure syntheses succeeded.

All four checksums and macOS audio decoding passed. Output: tmp/tts-samples/bear-identity/ with JSON, SSML and README. Full quality was not rerun for this isolated sample script; prior results above remain historical. User accepted shao3 pronunciation; bear listening choice pending. Production config, story inputs and MP3s unchanged.

## 正式生成记录（用户批准小熊③后）

- 修改 scripts/tts-config.json：azure-director-v3-approved；小熊 cheerful/excited 固定 narration-relaxed、1.1、-2%、-3Hz，保持 warm 原参数。
- snow-mittens meet 添加局部 shao3 标注；更新对应 preset 回归断言。
- 运行单篇 validate/review、audio:generate -- --publish、quality；刷新 narration.json、narration-index.json、narration-playback.json。
- 正式清单 104 个 clip / 103 个 MP3：Xiaoyi 68 条、Yunxi 14 条、Xiaohan 14 条、XiaoxiaoMultilingual 8 条；0 个 legacy-retained。
- 103 个新文件全部通过系统音频解码与摘要验证；102 个旧文件摘要保持不变，当前清单不再引用旧文件。
- 16 个 TS 测试文件 / 68 测试、12 Python 测试、lint、build、quality 全部通过。production-quality.log 和 production-validation.json 位于 tmp/tts-samples。
- 全程命令行验证，无 computer use；浏览器/实机未重新检查。用户要求确需 computer use 时先征得确认。
- 历史音频和 pre-production-backup 保留回退；未提交、推送或部署。

## 全量发音审阅与正式更新

- 遗漏修正：上一轮只处理用户举例的少，本轮覆盖全部 104 条输入，含旧活动、经典动画、第一版手套和四个故事包。AI 逐句按语境审阅，不冒称人工逐条听过。97 条、381 处显式读音；7 条未发现需要额外标注项。不声称原 97 条均读错。
- 对照包括种 zhong4、干 gan1、倒 dao4、落 luo4、露 lu4、角 jiao3；和 he2/huo5、空 kong1/kong4、只 zhi1/zhi3；深处 chu4、一扇门 shan4、为朋友 wei4 等。逐句全文、读音见 docs/production/runs/pronunciation-review.md。
- 代码：speech.ts 与 voice_director.py 支持 occurrence 定位重复词、每段最多 32 项；同一 prosody 内标音，不额外拆句/停顿。4 个包保存结构化标注，旧入口由 narration.ts 精确匹配审阅表补入。
- 新增 pronunciation-review.json 和 pronunciation_review.py；audio:pronunciation、正式生成和 audio:verify 检查全部输入的审阅覆盖、状态、实际发音区间与表内结论一致。新增/改文无审阅、重复记录或标注不同都会阻断；门禁不自动判断汉语语义正确性。
- 文档：AGENTS.md、STORY_STANDARD、AUTHOR_PROMPT、生产 README、TTS_DECISION、SDD 实例同步。后续 AI 必须逐句审阅并标数字声调（1～4，轻声5），有歧义先核对，不以自动一字一音字典替代语境。
- 运行 stories:validate/review/export、audio:pronunciation、audio:generate -- --publish、quality。当前 104 clip / 103 MP3；重录 96 个独立文件，复用 7 个。全部 MP3 系统解码通过，前版全部文件摘要保持不变。
- 69 TS 测试（16 文件）、15 Python 测试、lint、build、quality 全部通过。额外三个 sample 脚本经过离线 mock smoke 检查，确认带标注输入不破坏 A/B/C 对照；此项不是额外真实合成或试听证据。
- 记录：tmp/tts-samples/polyphone-quality.log、polyphone-validation.json、polyphone-generation.log。回退清单在 pre-polyphone-backup，旧录音不删除。全程没有 computer use；未提交、推送、部署。
