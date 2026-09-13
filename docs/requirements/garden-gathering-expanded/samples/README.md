# E1 声音与构图试样

打开 [试听与布局页](index.html)。A 为纯角色语音，B 为程序合成短音效＋角色对白；两套均已提供。没有正式发布或进入 E2。

- 四段声音分别约 3.960 / 3.840 / 6.024 / 4.272 秒，对应 x04c / x06c / x04d / x06d；由 macOS afinfo 读取，不代表听感通过。
- 使用当前配置小猫、小狐狸声线；生成记录见 audio-records.json，样稿读音审阅见 pronunciation-review.json。
- 图形复用现有 StoryArt/StoryBackdrop，新增花景层只在样稿内。320×360 逻辑舞台，PNG 为 2 倍渲染；不是浏览器热区测量或设备验收。
- 花丛第一版仍偏右，第二版延伸至中槽右侧；实际位置以 SVG 为准，较 Design 候选区域向左调整。未改变标准道具位。
- prepare.ts 生成隔离输入与 SVG；从仓库根用 `TSX_TSCONFIG_PATH=tsconfig.app.json node --import tsx docs/requirements/garden-gathering-expanded/samples/prepare.ts` 执行。
- generate.py 复用项目声音导演和合成缓存；仅在明确需要重新生成候选时运行，不发布。密钥只从环境取得。
- protected-before.json 保存 E1 前正式生成文件、旧包、旧音频、发音表与配置的哈希，交付时已验证全部不变。

待用户试听判断 A 是否足够，并确认构图；未模拟或冒称用户选择。

## B 对照样稿

用户已授权制作 B，尚未选择最终方案。四个 B WAV 为 24kHz 单声道，约 3.888/3.456/5.928/3.864 秒。make-b.py 使用固定随机种子、衰减正弦与噪声生成鼓/拍手近似音效，无外部录音；来源和混音哈希见 B-audio-records.json。

B 去掉拟声词后重新生成同角色对白，并在前面接短音效与 100ms 间隔；A 文件逐字节保留。本次不是严格单变量声音实验，页面已说明差别。B-pronunciation-review.json 为隔离的整句读音审阅，正式发音表未改。用户听感待确认，E2 未开始。
