# PLAN：REQ-20260912-TTS

已获用户授权实施，正式批量重录须等试听选择。本轮顺序：

- [x] P1 Review 指定实现与当前故事；记录真实问题与旧参数；查询 eastus voices/list（AC-02）。
- [x] P2 写 PRD/design/arch，定义身份、兼容、样本和验收边界。
- [x] P3 实现 speech schema、采集身份和运行时索引；保留旧入口（AC-01/06）。
- [x] P4 实现集中 profile/preset、能力校验、受限 SSML、缓存和 manifest 校验（AC-02～05/08）。
- [x] P5 迁移旧录音元数据，不重录；实现独立 audio:sample 并生成 8×3 样本（AC-07）。
- [x] P6 补齐 TS/Python 测试，运行 npm test/lint/build/quality，检查受影响播放路径（AC-09）。
- [x] P7 更新 TTS_DECISION、契约导出、Review Report，列证据与待试听限制。
- [x] P8 用户选定小熊③并授权全量正式重录；不使用 computer use，确需使用须先获用户确认（AC-10）。

每步失败先修复再推进。Azure 查询/合成失败时只报告安全错误，不泄露 credential；无需为已经授权的样本生成重复询问。实现与样本生成可验收，听感结论仍独立。

执行结果：P1～P7 已完成；67 个 Vitest + 11 个 Python 测试，lint/build/quality 通过；24 MP3 已生成。详见 [REVIEW_REPORT](REVIEW_REPORT.md)。P8 保留为明确的人工听感验收边界，不是尚未实现的代码任务。

## P9 试听反馈：少（shao3）

- [x] 定位《雪地找手套》朵朵原句与现存录音；保留正式数据。
- [x] 加入受限局部发音标注，贯通采集身份、SSML、缓存；补齐格式/重叠/注入测试。
- [x] 实际生成三组发音对照并通过 quality（68 个 TS、12 个 Python 测试）。
- [x] 用户确认 shao3 读音，已落正式故事输入。

小熊 warm/excited 的声线一致性仍待独立控制变量样本，不在本次纠音对照中改动。

## Bear identity audition follow-up

Pronunciation sample shao3 accepted by user. Added audio:sample:bear with four same-text Yunxi variants; output: tmp/tts-samples/bear-identity/. Checksums, MP3 decoding and comparison parameters verified. Bear selection pending; production config and audio remain unchanged.

## 正式生成完成

- [x] 用户选择③并授权全量生成，落实小熊参数和 shao3 标注。
- [x] 104 clip / 103 MP3 生成完成，播放投影已更新，旧录音留存。
- [x] quality 通过：68 TS、12 Python、lint/build；全量新 MP3 解码和旧文件摘要通过。
- [x] 同步 TTS_DECISION 和 Review Report；无 computer use、无提交/推送/部署。

以上正式生成状态替代前文历史阶段的等待试听/等待发布状态。

## 全量发音审阅增补

范围扩展为全部 104 条现存输入，不仅用户举例的少。按语境标注多音字和轻声，重复词用 occurrence 定位，保持字幕与整句韵律。所有输入都有精确文本审阅记录；正式生成前的 pronunciation_review 门禁校验覆盖/一致性。后续 AI 必须逐句审阅并标明 1～4 声或轻声 5；不能自动用一字一音字典代替语境判断。详见生产规范与 runs/pronunciation-review.md。全程不用 computer use。

全量审阅执行完成：104 条全部审阅，97 条/381 处标注，重录96个MP3、复用7个。69 TS、15 Python、lint/build/quality及系统解码通过。后续AI的强制逐句声调审阅已写入生产规范/提示/AGENTS和生成前门禁。
