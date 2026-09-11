# 当前语音方案：Azure 晓晓多语言预生成音频

更新：2026-09-09。四个原版活动、第一版手套样片、四个结构化故事包及旧动画入口，统一播放 Azure Speech 生成的 MP3。`zh-CN-XiaoxiaoMultilingualNeural` 在本次 eastus 资源的实时声线列表中为 GA；已验证支持使用的五种风格。

## 制作与播放

- `scripts/tts-config.json`：eastus、晓晓多语言、24 kHz 单声道 96 kbps MP3。
- `scripts/collect-narration.ts`：自动发现 `src/stories/packs/*.json` 并收集所有当前文案分支，当前 102 段（2026-09-11，含第四篇第二轮修订稿）；同文不同风格会报错，显式指定 `story`、`affectionate`、`cheerful`、`excited`、`empathetic`。语速 -5%，音高 +0 Hz；兴奋强度 1.1，其余 1.0。
- `scripts/generate-audio.py`：Python 标准库调用 Azure REST。运行前读取环境变量 `AZURE_SPEECH_KEY`，检查实际声线及风格；两路并发、单次 40 秒超时，暂时故障最多四次尝试。先生成全部音频，再原子发布清单；中断后可复用成功文件。
- 音频路径 hash 包括合成版本、声线、格式、文本、风格、情绪强度、速度和音高，避免改情绪后错误复用旧录音。
- `src/generated/narration.json`：当前发布清单；`public/audio/`：音频资产。为保留已有素材，不清除未引用的历史录音；当前播放只使用清单。
- 制作端读取密钥，网页只取静态 MP3。密钥不进入 Vite 环境变量、前端、音频清单或版本库。孩子操作不会发送给 Azure。
- 播放器 `EdgeAudioProvider` 保留旧类名以兼容旧动画接入，但已经是通用录音播放器。复用一个 HTMLAudioElement，不回退到设备 TTS。
- 播放结束或失败会通知互动反馈层；取消会丢弃旧通知。静音、暂停、后台及离开故事停止音频。新样片暂停时冻结动画及自动剧情转换，恢复后重播当前句。

## 重新生成

普通网页运行不需要 Python、密钥或 Azure 连接。只有重新制作语音才需要：

```bash
# 在已经 export AZURE_SPEECH_KEY 的 shell 中运行；若仅写在 .zshrc，使用新的交互式 zsh。
npm run audio:generate
npm run quality
```

`audio:generate` 使用现有 `.venv/bin/python`。新环境可先执行 `uv venv --python 3.13 .venv`，无额外 pip 依赖。脚本遵循标准 HTTPS 代理环境变量，不关闭 TLS 校验。

`npm run audio:verify` 校验当前文案、完整合成参数、清单和 MP3 文件头。调整 SSML 生成结构时也应更新 `tts-config.json` 的 `version`，使缓存失效。

## 反馈时序

原版：有效操作后有 650 ms 跨按钮触控保护；答对后至少展示 1.8 秒，并等待成功语音结束，才允许继续。重听成功语音重新保护。静音和明确音频错误走最短展示时间；无结束通知的故障最多等待 20 秒。

故事版：每个新叙事节拍等待当前语音及最短展示时间。小鸟出现、手套送达两个演出阶段结束后自动衔接剧情；需要孩子参与的地方等待新的点击。父级手势保护拦截双击尾部以及保护期间按下、解锁后才松开的触摸。

## 证据与边界

本次已实际调用用户的 eastus 资源生成 69 段当前语音，并通过 macOS 音频解析及浏览器 MP3 播放检查。第一批过长的成功台词已压缩后重新生成。具体听感与儿童节奏仍需要真机试听；桌面移动视口不能代替 iOS Safari、Android Chrome、微信里的实际触控和音频验收。

来源：[Azure 声线及风格](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts)、[REST 合成端点](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech)、[SSML 情感表达](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice)。
