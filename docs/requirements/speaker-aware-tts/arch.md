# Arch：Speaker-aware 静态 TTS

REQ-20260912-TTS · v1.0；PRD/design v1.0；基线 prd/design/arch v1.0。
代码起点 6284088，已有未提交 SDD 文件保留。遵循 ARCH-01～17/20～24；旧 ARCH-14 的文本唯一身份与 speaker 不切声线由本需求替代。旧文档作为版本背景，不把旧录音重新标成角色录音。

## 数据流与职责

Story Line → Speaker/Intent/Emotion → Voice Profile → Voice Preset Resolver → Allowlisted SSML → Azure Speech → MP3 Manifest → Static Playback。

TypeScript 契约限制 enum、prosody、segment/pause，采集器自动发现故事。ID 包含来源位置与完整方向摘要；同文字不同角色/情绪不合并。生成的 source→clipId 索引供播放器使用，浏览器不解析 preset。历史活动保留限定的文本查找适配层，不能用于新故事身份。

Python 标准库负责 profile/preset 解析、实时能力校验、SSML、hash、缓存、合成和校验，避免 JS/Python 重复维护 hash/SSML。配置集中在 tts-config.json。新依赖：无。完整制作 manifest 留在构建端；audio:collect 生成 ID→src 播放投影，predev/prebuild 自动刷新，避免前端携带 SSML 元数据。密钥仅 os.environ.get('AZURE_SPEECH_KEY')，不读 shell 文件；错误只报状态码/安全摘要。

| AC | 模块 | 验证 |
|---|---|---|
| 01 | speech schema、narration collector、索引 | TS 单元测试 |
| 02/03/04 | config、voice director、SSML builder | Python 单元测试、真实 voices/list |
| 05/08 | generator、manifest verifier、legacy archive | 缓存/迁移/失败测试 |
| 06 | SpeechProvider、EdgeAudioProvider、PackPlayer、旧入口 | Vitest 生命周期回归 |
| 07 | audio:sample | 24 个 MP3、SSML、参数及 HTML/README |
| 09 | npm scripts | quality 包含 Python/TS 测试 |

## 兼容与发布

本轮把清单迁移为 ID→对象，保留旧 MP3 路径，保存冻结 v1 清单。每条 legacy-retained 标明请求的 speaker 与实际生成的 voice/style 等；校验旧文件及输入签名，不能将 legacy 当作已完成的新 profile 合成。新正式生成必须显式开启发布命令参数，并重新查询能力、按完整参数 hash 生成，全部成功才原子替换 manifest。旧文件不删除。

schema 增加可选字段，旧 1.0 故事仍合法；显式段落文本必须等于 line.text。不直接允许 SSML。更新导出 JSON schema。未知 speaker/profile/voice 阻断制作；unsupported style 省略 express-as 保留 prosody 与 warning。pause 0～1000ms；总段数/总停顿有上限。自动分句仅 opt-in，不做 AI 推断。

hash 包含 config version/provider/region/format、speaker/profile、intent/emotion、text、segments、最终 style/degree/rate/pitch、SSML builder 结果。能力变化导致最终 SSML 变化也失效。缓存验证 MP3 与文件摘要；原子写入；并发 2、超时和有限重试。

## 风险、回退与交付

声线差异与年龄感须盲听；styleDegree/prosody 是服务提示，不保证听感线性。旧录音桥接是显式过渡状态；后续试听选择后才重录。回退保留 v1 清单与所有音频，代码可单独撤回本需求变更。未涉及账户/观察数据/后台。验证见 REVIEW_REPORT.md，执行见 PLAN.md；未提交/推送/部署。

## 发音标注增补

受限 segment.pronunciations: [{text, phoneme}]；每段最多 32 项，目标必须唯一存在且区间不重叠。TS/Python 双端检查字段、长度、拼音字符格式；Builder 将 shao3 转为 Azure SAPI 的 shao 3 并在原 prosody 内生成 phoneme 元素，alphabet 固定 sapi。仅支持普通带调拼音子集，不做自动多音字消歧或完整词典合法性检查；服务拒绝时制作失败，不静默退回错误读音。标注进入采集 ID、generation.segments、SSML 与缓存 hash。未标注台词的生成结果不变。

## 全量发音审阅增补

范围扩展为全部 104 条现存输入，不仅用户举例的少。按语境标注多音字和轻声，重复词用 occurrence 定位，保持字幕与整句韵律。所有输入都有精确文本审阅记录；正式生成前的 pronunciation_review 门禁校验覆盖/一致性。后续 AI 必须逐句审阅并标明 1～4 声或轻声 5；不能自动用一字一音字典代替语境判断。详见生产规范与 runs/pronunciation-review.md。全程不用 computer use。
