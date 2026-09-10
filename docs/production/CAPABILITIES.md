# 能力目录 v1.0

完整 ID 见 `capabilities.json`；由 `npm run stories:export` 从代码枚举导出。下列说明负责告诉作者“这些 ID 到底能做什么”。任何能力扩展都要同步枚举、画面实现、说明与相关检查；普通新故事不承担扩展。

## 角色与物体

| ID | 能表现的内容 |
|---|---|
| `bear / fox / cat / rabbit` | 现有原创动物；neutral/happy 两种表情。rabbit 为蓝制服朵朵 |
| `bear-cold / bear-warm` | 戴一只/两只红条纹手套的小熊，分别有呼气/开心反应 |
| `mitten-stripe / mitten-dot` | 红色条纹/蓝色圆点手套 |
| `snow / pine / bird` | 积雪、雪松枝、小鸟 |
| `snowman / footprints` | 完整雪人、一串大小脚印 |
| `blocks / posts` | 地面玩具积木、已立好的玩具支架 |
| `roof-coral / roof-blue` | 两种同功能不同颜色的棚顶 |
| `shelter-coral / shelter-blue` | 对应颜色的完整空雨棚 |
| `shelter-coral-full / shelter-blue-full` | 内有篮子的完整雨棚；篮子带入场动画 |
| `basket` | 单独野餐篮 |
| `drum / wait / clap` | 小鼓、等待图示、拍手图示；后两者适合协商选项，需要语音说明 |
| `flower` | 一朵花，可用于后续故事；不代表已有浇水、开花或生长模拟 |

没有手势识别或真正的物理碰撞。递送、搭建、演奏用场景快照与有限动效表达，不意味着关节骨骼、逐帧手指动作或自由视频生成。小鼓的动效不包含独立鼓声音效，叙述仍是预生成语音。

## 舞台

- 背景：`snow` 雪地、`rain` 小雨草地、`meadow` 晴天草地。
- `actor-left / actor-right`：上半部左、右两个大角色位。
- `prop-left / prop-center / prop-right`：地面三处物体位，可点击。
- `sky-left / sky-right`：远处小物或飞鸟位，只用于展示；校验器禁止把触控目标放在这些小位上。
- 同一幕不能重复 slot；空间关系需要换 slot 或换完整状态资产。不要在 consequence 中描述跨屏行走，而画面只换一句字幕。

字体沿用圆体标题与系统中文正文。色彩以雪蓝 `#dceef5`、雨灰绿 `#d9e7e3`、草绿 `#e4efd7`、日光黄 `#fff2bd`、珊瑚 `#dc8f79`、深青 `#294e57` 为主。舞台与字幕分开，移动端对象放大，提示文字不盖住主体。

## 动效与声音

| motion | 实际效果 |
|---|---|
| `still` | 静态展示，个别状态资产仍有其内置细节动画 |
| `arrive` | 从右上方出现，1.3 秒 |
| `wiggle` | 轻微摆动，1.6 秒 |
| `celebrate` | 两次轻跳，1.5 秒 |
| `deliver` | 从右上方移入当前位置，1.5 秒；不是自动寻找接收者 |
| `build` | 从上方落到当前位置，1.6 秒；不是自动装配任意零件 |
| `play` | 节奏缩放与摆动，1.7 秒 |

动作在进入节点时执行；同一节点被重试重新进入时会重新执行。可减弱动态效果的系统设置会关闭这些动画，但完整的最终状态仍可见。字幕和最终画面必须在无动画、无声音时也能支撑成人陪玩。

风格 `story / affectionate / cheerful / excited / empathetic` 分别用于叙述、温暖请求、轻快交流、短暂庆祝、理解与重试。统一 Azure `zh-CN-XiaoxiaoMultilingualNeural`，eastus；参数见 `scripts/tts-config.json` 和生成器。

## 缺口报告格式

报告具体剧情需求、现有能力为什么不能表达、受影响节点、是否有忠于目标的可行替代。不能写一个不存在的 asset/motion，不能用大段解释让用户想象缺失动画。第四个故事遇到缺口先记录为评测结果，由用户决定是否另开能力扩展工作。
