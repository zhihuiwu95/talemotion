# Azure Speech：Speaker-aware 静态语音流水线

更新：2026-09-12。实现与验证见 [Review Report](requirements/speaker-aware-tts/REVIEW_REPORT.md)；需求与实施顺序见 [PRD](requirements/speaker-aware-tts/prd.md)、[design](requirements/speaker-aware-tts/design.md)、[arch](requirements/speaker-aware-tts/arch.md)、[PLAN](requirements/speaker-aware-tts/PLAN.md)。

**当前本地正式状态：小熊③已采用；104 条台词完成多音字/轻声语境审阅，97 条保存 381 处显式读音，7 条记录无需额外标注。最新 103 个 MP3 已发布到本地播放清单，本轮重录 96 个、复用 7 个；旧文件保留回退。未提交、推送或部署。**

## 架构与身份

```text
Story Line
  ↓ speaker / intent / emotion / optional segments
Voice Profile
  ↓ profile defaults + intent preset + emotion preset
Voice Preset Resolver
  ↓ profile emotion adjustment + explicit line / segment override
Allowlisted SSML Builder
  ↓ fresh eastus capability check
Azure Speech → MP3 Manifest → Static Playback by clipId
```

旧采集器按 text 去重并丢失 speaker；同文异风格甚至会报错。旧全局 Xiaoxiao、-5%/+0Hz、强度 1.0/1.1 加上整句单一 style，无法建立角色身份。style 是表达提示，不能替代 voice。

新采集输入有 `id/source/text/speaker/speakerLabel/intent/emotion/voiceProfile` 及可选 `style/styleDegree/rate/pitch/segmentation/segments`。ID 是来源位置加完整方向摘要，不以 text 唯一标识；不同来源、角色、情绪产生不同 clipId。原活动的限定文本→ID 兼容索引只供旧入口，新故事按 `pack:<storyId>:<nodeId>` 取得编译生成的 ID；第一版手套按 adventure key 取得 ID。

`src/generated/narration.json` 是完整可审计清单：ID→对象，含 src、speaker、voiceProfile、实际 voice、inputHash、generationHash、audioSha256 与完整 generation（SSML/segments/参数/warnings）。`narration-index.json` 提供来源绑定；`narration-playback.json` 是 ID→src 的可再生投影，前端只带投影，不带完整 SSML/制作元数据。

`audio:collect` 刷新输入、索引和播放投影。`predev/prebuild` 自动执行采集；正式生成后执行 quality 再启动/构建，确保投影与 canonical manifest 一致。浏览器不选择 voice 或解释 emotion，不请求 Azure，不回退到设备 TTS。`SpeechRequest.id` 优先；显式 ID 缺失时立即报告失败，不能按文字找另一角色录音。历史 `EdgeAudioProvider` 名称保留。

## 当前角色声线

2026-09-12 实际请求 eastus `/cognitiveservices/voices/list`。所选声线均出现在返回的中文 Neural 列表。选中能力快照在 `scripts/azure-voices.snapshot.json`；样本查询的完整中文列表与 UTC 时间在 `tmp/tts-samples/voices-eastus.json`。每次样本/正式合成都重新查询；快照仅供离线测试，不是永久可用承诺。

| speaker / 别名 | profile | Azure voice | default style | default rate / pitch / degree |
|---|---|---|---|---|
| narrator / 旁白 | narrator | zh-CN-XiaoxiaoMultilingualNeural | story | -8% / +0Hz / 1.0 |
| duoduo / 朵朵 / 朵朵警官 | duoduo | zh-CN-XiaoyiNeural | cheerful | -1% / +1Hz / 1.0 |
| bear / 小熊 | bear | zh-CN-YunxiNeural | narration-relaxed | -6% / -3Hz / 1.0 |
| fox / 小狐狸 | fox | zh-CN-XiaohanNeural | cheerful | +1% / +1Hz / 1.0 |
| cat / 小猫；rabbit / 小兔 | duoduo（暂复用） | zh-CN-XiaoyiNeural | cheerful | -1% / +1Hz / 1.0 |

表中是基础参数，实际样本还叠加 intent/emotion。这些是待听的声线选择，不能从 Azure 的 Gender/名称推断儿童年龄真实性或声线适龄。

## 意图、情绪和风格

Intent：narration/dialogue/prompt/hint/success/comfort/question/ending。
Emotion：neutral/warm/gentle/curious/cheerful/excited/empathetic/sad/surprised。

`tts-config.json` 集中管理 profile、speaker alias、intent/emotion preset、profile 的 emotionOverrides 和 styleMap。合并顺序：profile defaults → intent → emotion → profile emotionOverrides → line override → segment override。profile 的 emotionOverrides 保持小熊低音区；显式 line/segment 参数优先。

旧 `style` 在未填写 emotion 时映射为语义情绪：story→neutral、affectionate→warm，其余同名；不把旧 style 强制塞给新 voice。显式 emotion 与 style 同时填写时，style 才作为有意的 Azure 覆盖。旧 empathetic 推导 hint，excited 推导 success，节点 ending 优先；其他按节点类型/defaultIntent，不用 NLP 猜测意图。

neutral 保留 profile；warm/gentle/empathetic 更慢；curious 轻微抬高；excited 第一轮 +5%、强度 1.35，pitch 上限起点 +3Hz，小熊经试听选定③：开心/兴奋均为 narration-relaxed、1.1、-2%、-3Hz。作者 override 校验 rate ±0～30%、pitch ±0～10Hz、degree 0.01～2；范围是工程边界，不是建议把值调到极端。

Azure 风格只使用本次 voice 的 StyleList。Xiaoyi 的 excited 映射 cheerful，empathetic 映射 gentle；Yunxi 的 warm/comfort 类映射 narration-relaxed、开心/兴奋固定 narration-relaxed；Xiaohan 的 excited→cheerful、empathetic→gentle。其余不支持的 style 省略 express-as、保留 voice+prosody，并在 generation.warnings 留下证据。未知 speaker/profile/voice 阻断制作，避免静默换成旁白。

微软说明 prosody 参数是合成建议，不能当作线性的听感保证；风格与支持情况见 [Azure SSML voice/prosody](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice)。本项目具体候选以真实 API 返回及样本为准。

## 结构化句内节奏

默认 `segmentation=none`，不自动拆所有台词。显式设为 `sentences` 时按 `。！？……` 分句，保留标点，句间加入 220/180/220/260ms 停顿，不加尾部停顿，不自动改变 emotion。

需要情绪转折时写结构化 segments：

```json
{
  "speaker": "小熊",
  "intent": "success",
  "emotion": "excited",
  "text": "太厉害了！和你一起玩，真开心！",
  "segments": [
    { "text": "太厉害了！", "emotion": "excited" },
    { "pauseMs": 180 },
    { "text": "和你一起玩，真开心！", "emotion": "warm", "rate": "-6%" }
  ]
}
```

仅生成 speak/voice/express-as/prosody/break/phoneme；文本 XML escape，控制字段校验。pause 必须是 0～1000ms 整数，最多 24 段、累计停顿 ≤3000ms。拼接 spoken text 必须等于字幕；显式 segments 与自动分句互斥。Story JSON 禁止任意 SSML/XML 字段和资源 URL。schema 1.0 可选扩展兼容旧包，`stories:export` 已同步 schema/intent/emotion 枚举；跨字段规则仍须 stories:validate。

## 缓存、正式发布与过渡

新 hash 使用排序 JSON，包含 ttsConfigVersion、provider、region、outputFormat、voice、speaker/profile、intent/emotion、text、最终 controls、segments、SSML 和 fallback 信息。参数/实现版本/实际能力变化都会影响相应生成缓存。缓存还检查文件 SHA256 和 MP3 头，不能仅凭文件存在复用。

合成两路并发、每请求 40 秒；429/暂时性服务或网络失败最多 4 次。先解析所有台词，再合成完整集合，最后原子替换 canonical manifest；失败不发布，成功文件可复用。旧录音不删除。发布后下一次 collect/build 刷新可再生投影。

冻结 `scripts/tts-legacy-manifest.json` 保存 v1 实际参数和来源。历史 metadata-only 桥接曾将所有现用 clip 标为 `legacy-retained`；top-level speaker 是目标角色，实际 generation.speaker=unspecified、voiceProfile=legacy-single、voice=旧 Xiaoxiao。这是已结束的过渡状态；当前 release=speaker-aware，全部条目已使用新录音。verify 对照冻结清单、旧 hash、输入摘要和字节 SHA256；候选配置调参不伪造旧录音变化，新正式发布则严格匹配当前配置。

## 操作顺序与样本

环境沿用 `.venv/bin/python`，标准库，无新增 pip/npm 依赖。密钥须已存在于当前环境；不读用户 `.zshrc`。

```bash
npm run audio:sample
npm run quality
# 人工试听确认声线和节奏之后，才使用下面的显式正式发布命令：
npm run audio:generate -- --publish
npm run quality
```

不带 `--publish` 的 audio:generate 会提示先试听，不会触发付费全量重录。`--migrate-legacy` 是一次性元数据桥接，已迁移时拒绝重复运行。

`tmp/tts-samples/` 已忽略 Git：A-current / B-speaker-aware / C-speaker-aware-segmented 共 24 MP3，README、逐样本 JSON/SSML、manifest、能力记录、index.html。A 复制当前录音；B/C 16 个候选。C 仅增加分句停顿以保持可比性；段级情绪能力另有测试，本轮不把两种变量混在 C 中。HTML 使用一个共享播放器，一次试听一个样本。

可直接打开本地 index.html；开发服务运行时也可访问 `/tmp/tts-samples/index.html`，生产构建不包含 tmp。先记录盲听角色、情绪、自然度、刺耳感、停顿，再选择 B/C 或调整参数；试听结果不得由自动测试代填。

## 安全和证据边界

Key 只用 `os.environ.get('AZURE_SPEECH_KEY')` 从制作环境读取，进入 Azure 请求 header；不 print、不写日志/清单/README/fixture，不进 VITE 变量或浏览器。不读完整 shell 配置。HTTPS/TLS 校验保持开启；不回显远端响应体、请求 header 或凭证异常。孩子操作不上传。

原暂停/取消/过期回调、最短 1.8 秒演出和 20 秒故障看门狗保持。MP3 成功、工程通过、桌面浏览器加载、真机听感与亲子体验分别记录。此次没有 Qwen、GPU、Python Server、实时 TTS 或 Agent 框架；是否需要替代引擎，应在这轮 Azure 盲听仍不满足目标后再形成独立需求。

## 局部发音纠正（试听反馈增补）

已支持 segment.pronunciations，例如：

```json
{
  "text": "小熊少了一只手套。点点它，问问怎么啦？",
  "pronunciations": [{"text": "少", "phoneme": "shao3"}]
}
```

该对象置于 line.segments；所有段落 text 拼接仍须等于字幕。目标词省略 occurrence 时必须唯一出现；重复词用 occurrence（从 1 起）定位。不匹配、重叠、超界或包含非白名单字段时拒绝。只标注已审定的具体词语，不把“少”等字全局替换。Builder 按 [Azure SAPI 规范](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-ssml-phonetic-sets#zh-cn) 将 shao3 编码为 `<phoneme alphabet="sapi" ph="shao 3">少</phoneme>`，保持同一个 prosody 容器。标注保留在 generation.segments 并参与缓存摘要。格式校验不保证所有拼音音节或所有 voice 均可合成，必须实际试听。

运行 `npm run audio:sample:pronunciation` 生成 tmp/tts-samples/pronunciation 的 A-original/B-unmarked/C-shao3；A 为正式录音副本，B/C 固定当前朵朵参数，只改变发音标注。该纠音样本已获用户确认；正式故事输入已加入此标注。多音字自动消歧、外部词典与儿化细节不在本轮支持范围。

## 已批准正式生成记录

配置版本 azure-director-v3-approved。小熊 cheerful/excited 使用③的 narration-relaxed / 1.1 / -2% / -3Hz，warm 保持原温和参数；其他角色沿用已试听的 B 方案，默认不加分句停顿。用户确认的 shao3 标注已写入 snow-mittens 的 meet 节点。

104 个 clip、103 个新 MP3；全部摘要及系统音频解码通过。完整 quality 通过（68 TS + 12 Python、lint、build）；命令行记录在 tmp/tts-samples/production-quality.log 和 production-validation.json。旧录音及 tmp/tts-samples/pre-production-backup 保留回退。未使用 computer use，未做新的浏览器/实机验收。

## 全量多音字审阅门禁

本轮逐句审阅全部 104 条输入，97 条补充发音标注、7 条未发现须额外标注项。不是声称原音频 97 条都读错。原活动/经典动画/第一版手套由 scripts/pronunciation-review.json 精确匹配来源、角色、完整文本补入；4 个故事包直接保存 segments.pronunciations。所有台词都要在审阅表留记录。正式生成和 audio:verify 检查覆盖、审阅状态、实际发音区间与记录一致；新增或修改台词必须重新审阅。无需标注也要明确审过，门禁本身不判断汉语语义。

作者必须按 STORY_STANDARD 和 AUTHOR_PROMPT 标注数字声调，先 audio:pronunciation 再合成。重复目标支持 occurrence，最多每段 32 项，保留同一个 prosody 容器；不强制增加停顿。审阅记录见 docs/production/runs/pronunciation-review.md。
