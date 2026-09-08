# 当前语音方案：Edge TTS 预生成音频

更新：2026-09-08。按用户本轮决定，H5 互动故事与旧动画演示都使用 Edge TTS 生成的 MP3。`BrowserSpeechProvider` 仅保留为旧实现及其测试，当前页面不再实例化它，也不自动退回设备语音。

## 制作与播放

- 制作端：Python `edge-tts==7.2.8`，普通话 `zh-CN-XiaoxiaoNeural`，语速 `-15%`，音高 `+0Hz`。
- `npm run audio:collect` 从四个互动故事及旧 Scene JSON 收集所有旁白分支（含欢迎、提示、错误提示、成功、结尾）。
- `scripts/generate-audio.py` 调用 Edge 在线服务，在 `public/audio/` 输出 MP3，并原子更新 `src/generated/narration.json`。
- 文件名由声线、速度、音高、文本的 SHA-256 摘要生成。已生成的文件可以复用；三路并发，每段最多四次尝试，有超时，失败不发布新清单。
- 播放端：`EdgeAudioProvider` 复用一个 HTMLAudioElement，在点击事件内立即调用 `play()`；无实时生成、无浏览器中文声库依赖、无 API 密钥。进入故事不自动朗读，点击“出发”开始。
- 错误或未获播放权限时显示文字和“重试声音”。取消、静音、离开故事、后台暂停会停止音频；旧请求的异步错误不会覆盖新请求状态。恢复活动重播当前指令。
- `npm run audio:verify` 检查当前文案对应的 hash 和实际文件，已接入 `npm run quality`，修改文案漏生成音频会使检查失败。

## 开发者重新生成

普通运行不需要 Python，也不需要连接 Edge：音频已随项目提供。

```bash
uv venv --python 3.13 .venv
uv pip install --python .venv/bin/python -r scripts/requirements-tts.txt
npm run audio:generate
npm run quality
```

代理如有需要，通过 `HTTPS_PROXY` 或 `https_proxy` 传入生成脚本；不关闭 TLS 校验。`scripts/requirements-tts.txt` 固定本次依赖版本。生成脚本需要网络；用户播放只向部署本网站的服务器请求 MP3，孩子的操作和观察记录不发送给 Edge。

## 当前证据与边界

本次已实际生成并解析 57 个 MP3，共约 2.7 MB，24 kHz 单声道。浏览器已观察到 MP3 地址、有效时长、播放时间推进和暂停状态。此方案解决了对系统 TTS 的依赖，并统一声线；仍不能保证任何手机都不会被系统音量、浏览器播放策略或网络问题影响。尚未真机验收 iOS Safari、Android Chrome、微信内置浏览器。

社区 Edge TTS 使用在线朗读服务，生成服务可能变化；已有音频的播放不依赖生成服务当时可用。后续如需正式生产服务，可替换制作脚本为 Azure Speech 等受支持服务，前端继续消费同样的 MP3 清单。没有引入常驻 Python 后端。

来源：[rany2/edge-tts 项目与用法](https://github.com/rany2/edge-tts)。此前 2026-09-05 的 Azure 优先建议已被本轮样片选择替代；本次未接入 Azure，也不依赖旧免费额度估算。
