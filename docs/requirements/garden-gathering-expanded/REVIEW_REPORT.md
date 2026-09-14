# E4–E6 Review Report

执行日期：2026-09-13～15。E3 已获用户确认；本轮按用户追加授权连续实施 E4–E6，不再逐阶段等待。Story/Catalog 1.1、PRD、Design、Architecture 均未改变。

## E4：制作管线

- FFmpeg 9.0.1 / ffprobe 已通过 Homebrew 安装，仅供本地制作/验证。没有 npm 依赖变更、没有前端音频引擎或二进制入库。缺失工具会明确报错，不回退纯 TTS。
- 实现 exact `pack:<id>:` 限定发布；候选生成及全部验证完成后才原子替换正式 manifest，原 manifest 以内容哈希保留在 scripts/audio-history。
- B 使用 manifest v3：source → 既有 Narration Line ID → speech/output；原人声与混音产物分别保留。旧记录的实际配置、声线能力和生成证据保留在 context/speech 中。A 在 v2 起点保持 v2。
- 固定注册的鼓/拍手 WAV 复用已获确认的 B 样本。混音为 cue 前缀 + 100ms 间隔 + 原人声，最终单条 MP3，浏览器仍使用原单音频元素。
- 混音缓存身份含人声/音效哈希、混音参数、版本及编码器版本；修改音量只重混。缺失、篡改、过期依赖、非法 scope、无生成证据均拒绝。
- 详细操作见 [AUDIO_PRODUCTION](../../production/AUDIO_PRODUCTION.md)。

## E5：正式限定发布与回归

执行 `npm run audio:generate -- --publish --source-prefix pack:garden-gathering-party:`，成功发布 34 个新来源，其中 8 个引用混音，去重后 22 条最终 MP3（4 条混音）。最终音频总计 1,473,008 bytes，去重时长 122.448 秒，最长 8.568 秒。此总时长不是单路径体验时长。

旧 104 条 speech 记录及最终路径逐项保持；保护基线中的 376 个旧音频/故事/配置文件 SHA256 全部一致。重新 collect 后 138 个 playback 映射均与正式 output 一致，未退回原人声。历史音频未删除。

`npm run quality` 通过：五个故事校验、音频验证、18 个 Vitest 文件共 89 项、Python 21 项、ESLint、TypeScript 与 Vite build。新 Python 离线测试 6 项覆盖真实本地混音、缓存、限定发布、失败原子性及旧记录保护。四组合路径及旧四包播放器回归由测试覆盖。

一次完整检查发现原 EdgeAudioProvider 测试仍直接读取 manifest v2 的 src；已改为读取浏览器实际使用的 playback 投影并保留原行为断言，重新 quality 全绿。没有放宽正式音频验证。

规模记录：[metrics](e6/metrics.json)、[validation-size](e6/validation-size.json)、[bundle-size](e6/bundle-size.json)、[quality 日志](e6/quality.log)。故事 JSON 53,745 bytes，gzip 4,147 bytes。相对已包含 E3 的 HEAD 256345e，入口 JS 增加 4,500 bytes；相同 Python gzip 口径增加 1,417 bytes。增加来自正式播放映射；没有混音库进入 bundle。34/40 节点及全量校验仅记录单次耗时，不作性能结论或算法优化。

## E6：本地验收

开发预览端口 5174，稳定构建预览端口 5175。开发页曾因验收同时运行 collect 触发 HMR、清理活动媒体导致结束按钮未解锁；改用无 HMR 的构建预览复验，不把该次状态当作正式通过证据。

实际浏览器验收（Codex In-app Browser / computer use）：

| 项目 | 结果与证据范围 |
|---|---|
| 本地入口 | localhost 与本机 LAN 地址的 5174/5175 均 HTTP 200；全部新最终音频资源 HTTP 200。LAN 检查由本机发起，不是手机连通证明 |
| 真实媒体 | 构建页开场 Audio currentTime 递增；g04d 加载 34404…MP3（5.928s），g06d 加载 5afe…MP3（3.888s），paused=false。均对应正式 composite output |
| 选择与反馈 | 开发页花边＋拍手实际点通，狐狸是拍手反馈对象；构建页草地＋敲鼓实际点通，篮子在左、小鼓在中间持续保留。其余组合由完整播放器路径测试覆盖 |
| 生命周期 | 暂停出现对话框且 audio paused=true/src=null；恢复重读当前幕。构建页 ending 音频 ended=true（1.776s）后重玩解锁，点击回到自动开场；退出回到五故事首页 |
| 结束顺序 | 构建页看到成果回应、告别时尚无 Ending 按钮，随后出现结束区；独立 Coda 的完整次序及无新操作由节点/播放器测试验证 |
| 响应式视觉抽查 | 375px 开场/花边，320px 花边音乐选择与目标标签，430px 花边反馈/草地画面可读且可操作；320px 可纵向滚动。四布局另有 E3 实际组件渲染证据。未做四布局×三宽度×所有字幕的穷举截图 |
| 错误日志 | 构建预览控制台 warn/error 为空；没有因正式混音资源出现播放失败提示 |

推荐使用无热更新干扰的 [构建预览](http://localhost:5175/?story=garden-gathering-party)；浏览器已恢复正常宽度并保留开场页。以上是本地工程与浏览器验收完成，人工体验验收保持开放。

## 未验证项与人工确认

- 实际手机 Safari/Chrome 的媒体权限、锁屏/切后台、扬声器音量及混音听感未验收；桌面浏览器响应式宽度不等于实机。
- 正式全篇配音逐句人工试听、角色声线舒适度、音效与人声响度平衡仍需用户确认。机器验证音频可解码、哈希/时长正确，不能替代听感。
- 3～4 岁儿童发现性、亲子共玩观察、学习效果，以及尾声是否真正消除“突然结束”的感受仍需实际体验；未给出合格内容评分。
- 未执行提交、推送或部署。本地正式发布指本仓库已生效的 manifest/MP3，不代表线上发布。
