# TaleMotion 架构约束

版本：v1.0 · 建立日期：2026-09-12 · 类型：通用架构基线。

## 1. 定位与当前边界

本文件规定实现职责、数据契约和工程约束。产品目标见需求实例，体验要求见 [design](design.md)。标记“现状”的内容由仓库静态核对，不表示已在所有设备上验证；标记“要求”的规则用于本次新增或修改范围。

**ARCH-01【要求】保持最小运行架构**：当前 H5 以静态构建交付，儿童游玩时不调用 LLM、TTS 生成或业务后台。在线上传、自由对话、账户、跨设备同步及生成服务均需独立需求与架构决策，不作为普通内容制作的隐含依赖。

| 层次 | 当前选型/职责 | 权威位置 |
|---|---|---|
| 页面与故事 UI | React + TypeScript | `src/App.tsx`、`src/play/`、`src/stories/` |
| 构建 | Vite，ES Modules，npm | `package.json`、`package-lock.json` |
| 故事绘本演出 | SVG/CSS + React，JSON 完整场景快照 | `src/stories/PackPlayer.tsx`、`StoryArt.tsx` |
| 经典动画 | PixiJS + GSAP，独立懒加载入口 | `src/play/ClassicDemo.tsx`、`src/runtime/` |
| 契约验证 | Zod + 图语义检查 + 路径验证 | `src/stories/schema.ts`、`engine.ts`、`src/schema/scene.ts` |
| 音频 | 制作时 Azure Speech；游玩时播放本地网站 MP3 | `scripts/`、`src/runtime/audio/` |
| 测试与静态检查 | Vitest、Testing Library、jsdom、ESLint、TypeScript | `package.json` 和已有测试 |

具体依赖版本以锁文件为准，Node 要求以 `package.json#engines` 为准。不要把示例资料的“单文件 HTML、零 npm 依赖、Canvas 2D”移植到本项目。

## 2. 模块边界与复用

```text
story packs JSON → schema + catalog → library 自动发现
                                      ↓
StoryLibrary → PackPlayer → engine.transition
                    ├── StoryArt + stories.css
                    ├── useInteractionGuard
                    └── EdgeAudioProvider → 预生成 MP3

经典 Scene JSON → Scene schema → TimelineEngine → ActionRegistry
                                                → Pixi / effects / audio
```

- **ARCH-02【要求】数据与演出分离**：新故事只新增 `src/stories/packs/<id>.json` 作为内容注册单元，生成配音和记录走已有工具链。不得按新故事 ID 添加播放器分支、手工注册列表或复制专属播放器。
- **ARCH-03【要求】共享职责稳定**：故事状态转换放在 `engine.ts`，交互保护复用 `useInteractionGuard`，音频通过已有 provider 管理，绘制与动作复用目录能力。UI 不重复实现契约校验或私有状态机。
- **ARCH-04【要求】两条运行路径独立**：故事包 schema 与经典 Scene schema 都可能使用版本 `1.0`，但不是同一种协议。不得把两套动作、节点或播放器混用。经典 TimelineEngine 决定执行时间，ActionRegistry 只分发允许动作，渲染器不理解具体故事。
- **ARCH-05【要求】兼容已有入口**：原四活动、第一版手套和经典演示保留对照；新包 ID 不占用历史 ID。涉及导航的变更检查 `/?story=<id>`、返回首页及受影响历史入口。

【现状】`library.ts` 使用 eager glob 在开发/构建时发现并校验故事包；错误包可能阻断库加载。当前不是在线上传系统，也没有保证单个坏包在浏览器中隔离失败。新需求若要在线内容或容错隔离，须明确新增能力。

## 3. 契约、兼容与能力扩展

- **ARCH-06【要求】校验先于播放**：可执行权威为 [schema.ts](../../src/stories/schema.ts)、[catalog.ts](../../src/stories/catalog.ts) 与路径验证。必须检查唯一 ID、已知能力与依据、目标可见性、合法引用、可达性、无自动循环和可结束路径；不只检查 JSON 能否解析。
- **ARCH-07【要求】声明式内容**：故事不得嵌入 JavaScript、HTML、CSS、SSML 或任意资源 URL。来源链接属于 provenance 元数据，不能当作运行时加载资源。不得用 `eval`、动态代码执行或 HTML 注入解释内容。
- **ARCH-08【要求】完整快照与明确分支**：每幕实体完整声明，不继承上一幕遗漏实体。`acceptance` 覆盖所有节点和选择，`free` 不判错；详细规则引用 [STORY_STANDARD](../production/STORY_STANDARD.md)。
- **ARCH-09【要求】扩展能力必须贯通**：新增能力时同步目录枚举、schema（如需）、画面/动作实现、必要测试和说明；运行 `npm run stories:export` 更新导出文件。不得手改导出 JSON 掩盖源代码缺口，或放宽验证器让不支持的故事通过。
- **ARCH-10【要求】显式兼容决策**：破坏性字段或语义变化须说明 schema/catalog 版本、旧包处理、迁移验证和回退方式；不能只改版本字符串。当前尚无完整迁移框架，不把“支持迁移”写成既有能力。

普通故事遇到缺口，先按 [CAPABILITIES](../production/CAPABILITIES.md) 报告具体受影响节点与可行替代；只有本次明确包含能力扩展时才进入共享代码。

## 4. 状态、异步与资源生命周期

- **ARCH-11【要求】游玩状态在内存**：节点、选择历史、重试次数由当前会话管理，重玩重新初始化。刷新续玩、跨标签同步和跨设备进度不是现有保证，新增时单独设计。
- **ARCH-12【要求】防重入与过期回调**：UI 禁用态之外还需即时交互保护；异步音频完成回调必须确认仍属于当前节点/会话。快速重复点击、重听、暂停、返回、重玩不得引发额外推进。
- **ARCH-13【要求】生命周期可清理**：暂停/后台暂停停止推进并取消音频；恢复沿用当前幕重播语义；卸载/返回清理音频、监听与计时器。经典动画还须清理时间轴、特效和渲染资源，重启恢复初态。

【现状】故事 `beat` 在最短演出和音频完成后推进，`interactive` 等待选择，`ending` 等待主动退出/重玩。共享目录最短演出 1.8 秒，交互保护含音频看门狗。参数归公共代码所有，作者不能用 JSON 自定义解锁时间；修改时覆盖静音、音频失败和过期回调场景。

> 2026-09-12 后续需求说明：v1.0 中 text-only / speaker 仅署名的现状描述已由 [Speaker-aware TTS 实例](../requirements/speaker-aware-tts/arch.md) 替代。当前制作支持角色声线身份；正式录音仍明确保留旧版，候选待试听。

## 5. 语音与静态资产

- **ARCH-14【要求】先审台词再生成**：复用现有采集、缓存和生成流程。`line.text` 参与音频采集，文本相同却风格不同会被采集器拒绝；`speaker` 不用于切换声音。
- **ARCH-15【要求】失败可继续**：音频失败不得使故事永久锁住；保留字幕、画面和有限等待后的继续路径。资源错误须有合适提示，但不承诺未实现的全局重试、离线缓存或远程加载超时机制。
- **ARCH-16【要求】密钥留在制作环境**：TTS 密钥仅从环境读取，不进入源码、JSON、日志或 `VITE_*` 前端变量。具体声线、区域和参数以 [TTS_DECISION](../TTS_DECISION.md) 与 `scripts/tts-config.json` 为准；provider 的历史文件名不代表当前仍用 Edge 在线生成。
- **ARCH-17【要求】保留历史资源**：优先复用缓存，不删除旧音频和原始实验记录。台词修改后核对索引与新音频，不能从生成成功推断真实设备听感正确。

【现状】故事画面主要是代码内 SVG/CSS，音频随静态站点分发；经典演示使用本地资产。首次访问仍需加载站点资源，无 service worker 离线可用承诺。

## 6. 本地数据、输入与依赖

- **ARCH-18【要求】最少数据**：家长观察由成人主动保存到本浏览器，提供查看、JSON 导出和确认清除；不自动采集儿童语音、身份、设备指纹或外部分析事件。新采集或外传必须在 PRD 中明确目的与用户行为。
- **ARCH-19【要求】边界数据校验**：URL 选择只匹配已知内容；存储读取需处理缺失、坏 JSON 与版本差异。新增/修改持久化逻辑时补充对应字段校验与写失败处理，不把当前部分字段检查宣称为完整数据迁移保障。
- **ARCH-20【要求】依赖有用途**：新增包说明解决的问题、已有能力为何不足、包体/运行成本及回退方案；不为纯 JSON 制作引入新运行依赖。不加载内容提供的任意脚本，不将用户输入直接注入 HTML。

【现状】观察存储 key 为 `talemotion-observations-v1`，读取过滤部分字段并最多返回最近 100 条；它不是远端数据库，也不是经过验证的儿童评估系统。

## 7. 验证与交付

**ARCH-21【要求】验证与改动风险匹配**：复用有意义的既有检查，新增测试覆盖新增行为、契约或回归风险；不为可逆文档改动编造业务测试。不删除原有反例来取得通过结果。

| 变更类型 | 必需检查 |
|---|---|
| 仅文档基线/说明 | 文件链接、命令/路径、跨文档一致性、Git diff；无需生成语音或全量运行产品测试 |
| 故事包复用制作 | 单篇 validate → 单篇 review → 内容修订 → audio:generate → 一次 quality → 运行记录 |
| 目录/schema/运行时/交互 | 受影响契约及行为测试；相关导出同步；一次 quality；按风险做目标节点浏览器检查 |
| 样式/新资产 | 相关功能检查与 quality；窄视口、目标状态的视觉/交互检查；真实设备项单列 |
| 经典场景/动作 | scene:validate、对应动作/时间轴/生命周期测试、quality；受影响演示路径检查 |

```bash
# 普通单篇故事，替换 <id>
npm run stories:validate -- src/stories/packs/<id>.json
npm run stories:review -- src/stories/packs/<id>.json
# 台词审定后
npm run audio:generate
npm run quality
```

`quality` 当前依次执行 scene:validate、stories:validate、audio:verify、test、lint、build。`stories:review` 无文件参数会更新全量生成分镜；`audio:verify` 会先采集旁白，不能一概视为无文件副作用的命令。执行前后检查 diff。

**ARCH-22【要求】证据分层**：工程结果、内容审阅、浏览器预览、真实手机声音与家庭观察分别记录。jsdom UI 路径测试没有真实布局和扬声器证明；作者 acceptance 不能代替独立内容判断。纯 JSON 工作默认不使用 computer use，具体规则引用 [EVALUATION](../production/EVALUATION.md)。

**ARCH-23【要求】性能用实测约束**：保留经典演示懒加载；故事包目前主入口加载，不宣称已经按故事拆包。涉及包体、并发音频、动画或大量内容时，记录构建结果及相关设备/网络测量，再在实例中设目标；不直接继承示例的 60fps、3G 首屏 3 秒等未测承诺。

**ARCH-24【要求】交付分阶段**：修改前检查 Git 状态并保留他人变化；构建产物为 `dist/`，不是源码 HTML。开发用 `npm run dev -- --host 0.0.0.0` 和终端实际端口；localhost 通不代表手机 LAN 通。提交、推送、合并、部署和线上验证分别遵循授权并报告事实。部署时保留上一份可用产物及对应源码/资源版本，写明恢复办法。

## 8. 架构实例最小模板

功能或能力扩展的 `arch.md` 按以下结构填写，简单需求可合并到需求文档。普通故事引用本基线并记录“复用现有能力”即可。

```markdown
# 架构实例：[需求名称]
需求 ID / PRD 版本 / design 实例版本：
引用基线：arch v1.0 / design v1.0 / prd v1.0
代码基线：commit 或工作区状态
适用规则 / 偏离项 / 决定来源：

## 1. 需求到实现
| AC / 页面 ID | 预期行为 | 复用或修改模块/文件 | 验证方法 |
|---|---|---|---|
| [ID] | [行为] | [路径及职责] | [证据类型] |

## 2. 数据和状态
[契约变化、节点/会话转换、持久化范围、兼容与迁移；无变化写明]

## 3. 资源与异步
[音频、动效、加载、失败降级、取消和卸载行为]

## 4. 外部依赖
[新增包或服务、输入输出、调用时机、超时/失败、费用、密钥边界；没有则写无]

## 5. 取舍与风险
[方案、理由、替代方案、影响范围、待定问题、回退办法]

## 6. 实施与验证
[按可运行步骤拆解；相关测试/命令、浏览器范围、仍需实机的项目]

## 7. 交付记录
[实际结果和证据位置；构建、提交、推送、部署、线上验证各自状态]
```

新基线没有补齐全量设计 Token、在线内容隔离、schema 迁移框架、远程资产取消机制或真实设备验收。后续需求涉及这些部分时，明确新增工作与可验证结果。
