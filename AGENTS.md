# TaleMotion

面向亲子共玩的 H5 互动故事原型。原活动和第一版手套保留对照；故事包不是学习效果证明。

- 栈：React / TypeScript / Vite，故事播放器用 SVG/CSS；经典动画用 Pixi/GSAP。
- 开发：`npm run dev -- --host 0.0.0.0`，用终端实际端口；密钥只走环境，勿读取完整 shell 配置。
- 故事入口：`docs/production/README.md`；制作合同在 `STORY_STANDARD.md`、任务提示在 `AUTHOR_PROMPT.md`。
- 新故事只加 `src/stories/packs/<id>.json`，自动注册、采集旁白和运行路径测试；不按故事 ID 写播放器分支。
- 单篇检查：`npm run stories:validate -- src/stories/packs/<id>.json`。
- 单篇审阅：`npm run stories:review -- src/stories/packs/<id>.json`；无文件参数时更新全量生成分镜。
- 台词审定后 `npm run audio:generate`；最终 `npm run quality`。结构通过不代表内容、视觉或真实播放通过。
- 纯数据制作默认不使用 computer use；按 EVALUATION 分层记录，未检查的视觉/实机维度写待验证。
- 第四篇已完成两轮内容修订并通过本地工程门禁；内容评分、修订版预览与实机仍待确认，见 `docs/production/runs/fourth-story-review.md` 和 `docs/production/runs/fourth-story-revision.md`。不作合格范文，不覆盖首次实验记录。
- 修改前检查 git 状态，保留别人的改动和历史音频；提交、推送、部署分别遵循用户授权。
