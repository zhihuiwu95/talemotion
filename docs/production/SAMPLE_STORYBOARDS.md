# 故事包审阅分镜

由 `npm run stories:review` 从故事 JSON 生成。表格帮助人工核对，不代表内容质量自动通过。

## 雨后的花园小聚会：一起开场啦 (garden-gathering-party)

目标：在准备聚会时，体验发现空间需要、听见双方愿望、共同调整，并享受一起准备的聚会。

依据：moe-social、naeyc-play、takacs-2015。本故事未验证学习效果；完成、重玩、点击或分享都不能作为能力或品德测评。

观察：孩子是否注意到小狐狸想看花、小猫想在中间玩鼓？是否关注篮子移动后小鼓的位置变化？可以指认或用动作表达。

| 节点 | 台词与情绪 | 场景对象 | 孩子动作与后果 |
|---|---|---|---|
| s01 · beat | 朵朵：雨停了，小狐狸和小猫带着篮子和小鼓，来到花园。 (neutral)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-left/still<br>drum@prop-right/still | 演出结束 → s02 |
| s02 · beat | 小狐狸：我带了野餐篮，想找个能看见花的地方，和大家一起聚会。 (cheerful)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>fox@actor-left/wiggle<br>cat@actor-right/still<br>basket@prop-left/still<br>drum@prop-right/still | 演出结束 → s03 |
| s03 · beat | 小猫：我带了小鼓，等下我们一起玩音乐吧！ (cheerful)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/wiggle<br>basket@prop-left/still<br>drum@prop-right/still | 演出结束 → s04 |
| s04 · interactive | 小狐狸：我们先放花这边试试吧。点点篮子，帮我挪到中间。 (cheerful)<br>文字提示：点点篮子，挪到中间。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-left/still<br>drum@prop-right/still | 把篮子挪到中间 → s05：篮子从左侧移到中间；小鼓仍在右侧。 |
| s05 · beat | 小猫：篮子摆好啦！我想把小鼓放在中间，让大家都能一起玩。咦，中间有篮子呢。 (cheerful)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-center/still<br>drum@prop-right/still | 演出结束 → s06 |
| s06 · beat | 小狐狸：那我们挪一挪吧。我还是想让篮子靠花一点。 (cheerful)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>fox@actor-left/wiggle<br>cat@actor-right/still<br>basket@prop-center/still<br>drum@prop-right/still | 演出结束 → s07 |
| s07 · beat | 小猫：中间留给小鼓就好。篮子放花边或左边，我都喜欢。我来挪鼓！ (cheerful)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/wiggle<br>basket@prop-center/still<br>drum@prop-right/still | 演出结束 → s08 |
| s08 · interactive | 小狐狸：左边也能看花，我也喜欢。点我，篮子去右边花旁；点小猫，篮子去左边草地。 (cheerful)<br>文字提示：点狐狸去花边，点小猫去左边。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-center/still<br>drum@prop-right/still | 篮子去右边花旁 → f01：篮子中间→右侧，小鼓右侧→中间，花景保持。<br>篮子去左边草地 → g01：篮子中间→左侧，小鼓右侧→中间，花景保持。 |
| f01 · beat | 小狐狸：篮子靠着花，小鼓到了中间，真合适！ (cheerful)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-right/still<br>drum@prop-center/still | 演出结束 → f02 |
| f02 · beat | 小猫：这里敲鼓，大家都能加入啦！谢谢你帮忙挪篮子。 (cheerful)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-right/still<br>drum@prop-center/still | 演出结束 → f03 |
| f03 · interactive | 小猫：小聚会开场啦！想一起拍手，就点点我；想敲小鼓，就点小鼓。你来选！ (cheerful)<br>文字提示：点小猫选拍手，点鼓选敲鼓。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-right/still<br>drum@prop-center/still | 跟着一起拍手 → f04c：小猫和鼓开始演奏，随后邀请点狐狸加入。<br>听一小段再敲鼓 → f04d：小猫先演奏短节奏，随后邀请孩子点鼓加入。 |
| f04c · beat | 小猫：听，我先敲起来啦！ (cheerful)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>制作音效：drum-short<br>fox@actor-left/still<br>cat@actor-right/play<br>basket@prop-right/still<br>drum@prop-center/play | 演出结束 → f05c |
| f05c · interactive | 小狐狸：我也想加入！点点我，我们一起拍拍手吧！ (cheerful)<br>文字提示：点点小狐狸，一起拍手。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-right/still<br>drum@prop-center/still | 和小狐狸拍手 → f06c：狐狸加入节奏摆动，小猫与鼓继续演奏；保留篮子位置。 |
| f06c · beat | 小狐狸：我跟上鼓声啦！ (cheerful)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>制作音效：drum-clap-short<br>fox@actor-left/play<br>cat@actor-right/play<br>basket@prop-right/still<br>drum@prop-center/play | 演出结束 → f06 |
| f04d · beat | 小猫：这一小段敲完啦，接下来请你和小狐狸一起！ (cheerful)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>制作音效：drum-short<br>fox@actor-left/still<br>cat@actor-right/play<br>basket@prop-right/still<br>drum@prop-center/play | 演出结束 → f05d |
| f05d · interactive | 小狐狸：小鼓就在中间呢。点点小鼓，和我一起敲吧！ (cheerful)<br>文字提示：点点中间的小鼓。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-right/still<br>drum@prop-center/still | 和小狐狸敲鼓 → f06d：狐狸与中间鼓节奏摆动，篮子保留所选位置。 |
| f06d · beat | 小狐狸：我们的鼓声也响起来啦！ (cheerful)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>制作音效：drum-short<br>fox@actor-left/play<br>cat@actor-right/still<br>basket@prop-right/still<br>drum@prop-center/play | 演出结束 → f06 |
| f06 · beat | 小猫：刚才还要找地方，现在我们都能围着小鼓玩啦。 (warm)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-right/still<br>drum@prop-center/still | 演出结束 → f07 |
| f07 · beat | 小狐狸：花还看得见，咚咚歌也真好听。和你们一起，我真喜欢。 (warm)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-right/still<br>drum@prop-center/still | 演出结束 → f08 |
| f08 · beat | 朵朵：花园里的小聚会，留下了一段咚咚歌。小狐狸、小猫，下次再一起玩吧。 (gentle)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-right/still<br>drum@prop-center/still | 演出结束 → f09 |
| f09 · ending | 小猫：下次见！ (warm)<br>文字提示：下次再一起玩。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-right/still<br>drum@prop-center/still | 主动结束／重玩 |
| g01 · beat | 小狐狸：篮子在左边，也能看见花，小鼓到了中间，真合适！ (cheerful)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-left/still<br>drum@prop-center/still | 演出结束 → g02 |
| g02 · beat | 小猫：这里敲鼓，大家都能加入啦！谢谢你帮忙挪篮子。 (cheerful)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-left/still<br>drum@prop-center/still | 演出结束 → g03 |
| g03 · interactive | 小猫：小聚会开场啦！想一起拍手，就点点我；想敲小鼓，就点小鼓。你来选！ (cheerful)<br>文字提示：点小猫选拍手，点鼓选敲鼓。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-left/still<br>drum@prop-center/still | 跟着一起拍手 → g04c：小猫和鼓开始演奏，随后邀请点狐狸加入。<br>听一小段再敲鼓 → g04d：小猫先演奏短节奏，随后邀请孩子点鼓加入。 |
| g04c · beat | 小猫：听，我先敲起来啦！ (cheerful)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>制作音效：drum-short<br>fox@actor-left/still<br>cat@actor-right/play<br>basket@prop-left/still<br>drum@prop-center/play | 演出结束 → g05c |
| g05c · interactive | 小狐狸：我也想加入！点点我，我们一起拍拍手吧！ (cheerful)<br>文字提示：点点小狐狸，一起拍手。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-left/still<br>drum@prop-center/still | 和小狐狸拍手 → g06c：狐狸加入节奏摆动，小猫与鼓继续演奏；保留篮子位置。 |
| g06c · beat | 小狐狸：我跟上鼓声啦！ (cheerful)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>制作音效：drum-clap-short<br>fox@actor-left/play<br>cat@actor-right/play<br>basket@prop-left/still<br>drum@prop-center/play | 演出结束 → g06 |
| g04d · beat | 小猫：这一小段敲完啦，接下来请你和小狐狸一起！ (cheerful)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>制作音效：drum-short<br>fox@actor-left/still<br>cat@actor-right/play<br>basket@prop-left/still<br>drum@prop-center/play | 演出结束 → g05d |
| g05d · interactive | 小狐狸：小鼓就在中间呢。点点小鼓，和我一起敲吧！ (cheerful)<br>文字提示：点点中间的小鼓。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-left/still<br>drum@prop-center/still | 和小狐狸敲鼓 → g06d：狐狸与中间鼓节奏摆动，篮子保留所选位置。 |
| g06d · beat | 小狐狸：我们的鼓声也响起来啦！ (cheerful)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>制作音效：drum-short<br>fox@actor-left/play<br>cat@actor-right/still<br>basket@prop-left/still<br>drum@prop-center/play | 演出结束 → g06 |
| g06 · beat | 小猫：刚才还要找地方，现在我们都能围着小鼓玩啦。 (warm)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-left/still<br>drum@prop-center/still | 演出结束 → g07 |
| g07 · beat | 小狐狸：花还看得见，咚咚歌也真好听。和你们一起，我真喜欢。 (warm)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-left/still<br>drum@prop-center/still | 演出结束 → g08 |
| g08 · beat | 朵朵：花园里的小聚会，留下了一段咚咚歌。小狐狸、小猫，下次再一起玩吧。 (gentle)<br>文字提示：看一看，听听朋友的话。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-left/still<br>drum@prop-center/still | 演出结束 → g09 |
| g09 · ending | 小猫：下次见！ (warm)<br>文字提示：下次再一起玩。 | meadow-after-rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-left/still<br>drum@prop-center/still | 主动结束／重玩 |

### 选择前后的实际差异

只比较 JSON 快照；动效执行、空间含义和双方同意仍需审阅。无位置变化不一定是错误，不能用动效自动证明协商成立。

| 选择 | 实际目标 / 口头提示 | 下一幕状态差异 | 作者承诺 |
|---|---|---|---|
| s04/try-basket → s05 | basket@prop-left<br>口头：我们先放花这边试试吧。点点篮子，帮我挪到中间。<br>文字标签：把篮子挪到中间 | basket.slot: prop-left → prop-center | 篮子从左侧移到中间；小鼓仍在右侧。 |
| s08/flower → f01 | fox@actor-left<br>口头：左边也能看花，我也喜欢。点我，篮子去右边花旁；点小猫，篮子去左边草地。<br>文字标签：篮子去右边花旁 | fox.mood: neutral → happy<br>cat.mood: neutral → happy<br>basket.slot: prop-center → prop-right<br>drum.slot: prop-right → prop-center | 篮子中间→右侧，小鼓右侧→中间，花景保持。 |
| s08/grass → g01 | cat@actor-right<br>口头：左边也能看花，我也喜欢。点我，篮子去右边花旁；点小猫，篮子去左边草地。<br>文字标签：篮子去左边草地 | fox.mood: neutral → happy<br>cat.mood: neutral → happy<br>basket.slot: prop-center → prop-left<br>drum.slot: prop-right → prop-center | 篮子中间→左侧，小鼓右侧→中间，花景保持。 |
| f03/clap → f04c | cat@actor-right<br>口头：小聚会开场啦！想一起拍手，就点点我；想敲小鼓，就点小鼓。你来选！<br>文字标签：跟着一起拍手 | cat.motion: still → play<br>drum.motion: still → play | 小猫和鼓开始演奏，随后邀请点狐狸加入。 |
| f03/drum → f04d | drum@prop-center<br>口头：小聚会开场啦！想一起拍手，就点点我；想敲小鼓，就点小鼓。你来选！<br>文字标签：听一小段再敲鼓 | cat.motion: still → play<br>drum.motion: still → play | 小猫先演奏短节奏，随后邀请孩子点鼓加入。 |
| f05c/join-clap → f06c | fox@actor-left<br>口头：我也想加入！点点我，我们一起拍拍手吧！<br>文字标签：和小狐狸拍手 | fox.motion: still → play<br>cat.motion: still → play<br>drum.motion: still → play | 狐狸加入节奏摆动，小猫与鼓继续演奏；保留篮子位置。 |
| f05d/join-drum → f06d | drum@prop-center<br>口头：小鼓就在中间呢。点点小鼓，和我一起敲吧！<br>文字标签：和小狐狸敲鼓 | fox.motion: still → play<br>drum.motion: still → play | 狐狸与中间鼓节奏摆动，篮子保留所选位置。 |
| g03/clap → g04c | cat@actor-right<br>口头：小聚会开场啦！想一起拍手，就点点我；想敲小鼓，就点小鼓。你来选！<br>文字标签：跟着一起拍手 | cat.motion: still → play<br>drum.motion: still → play | 小猫和鼓开始演奏，随后邀请点狐狸加入。 |
| g03/drum → g04d | drum@prop-center<br>口头：小聚会开场啦！想一起拍手，就点点我；想敲小鼓，就点小鼓。你来选！<br>文字标签：听一小段再敲鼓 | cat.motion: still → play<br>drum.motion: still → play | 小猫先演奏短节奏，随后邀请孩子点鼓加入。 |
| g05c/join-clap → g06c | fox@actor-left<br>口头：我也想加入！点点我，我们一起拍拍手吧！<br>文字标签：和小狐狸拍手 | fox.motion: still → play<br>cat.motion: still → play<br>drum.motion: still → play | 狐狸加入节奏摆动，小猫与鼓继续演奏；保留篮子位置。 |
| g05d/join-drum → g06d | drum@prop-center<br>口头：小鼓就在中间呢。点点小鼓，和我一起敲吧！<br>文字标签：和小狐狸敲鼓 | fox.motion: still → play<br>drum.motion: still → play | 狐狸与中间鼓节奏摆动，篮子保留所选位置。 |

验收路径：
- 花边一起拍手：try-basket → flower → clap → join-clap → f09
- 花边一起敲鼓：try-basket → flower → drum → join-drum → f09
- 草地一起拍手：try-basket → grass → clap → join-clap → g09
- 草地一起敲鼓：try-basket → grass → drum → join-drum → g09

## 雨后的花园小聚会 (garden-gathering)

目标：在准备小聚会时，体验听见两位朋友的愿望，并选择双方接受的篮子摆放安排。

依据：moe-social、naeyc-play、takacs-2015。本故事未验证学习效果；完成、重玩、点击或分享都不能作为能力或品德测评。

观察：孩子是否注意到小狐狸想靠花、小猫想留空地？可以指画面或用动作表示，不要求说出固定答案。

| 节点 | 台词与情绪 | 场景对象 | 孩子动作与后果 |
|---|---|---|---|
| meet · interactive | 朵朵：小狐狸和小猫想办小聚会。先听听小狐狸吧。 (story)<br>文字提示：点点小狐狸，听听它的想法 | meadow<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-left/still<br>flower@prop-right/still | 听听小狐狸的愿望 → fox-wish：小狐狸轻轻摇动，说想把篮子摆在花旁。 |
| fox-wish · interactive | 小狐狸：我想把野餐篮摆在花旁，边吃点心边看花。点点小猫，听听它吧。 (affectionate)<br>文字提示：点点小猫，听听它吧 | meadow<br>fox@actor-left/wiggle<br>cat@actor-right/still<br>basket@prop-left/still<br>flower@prop-right/still | 点点小猫，听听它吧 → cat-wish：小猫轻轻摇动，说想给花旁留一点空地，也接受两个位置。 |
| cat-wish · interactive | 小猫：花旁留点空地就好。篮子放花边、放左边草地，我都愿意。 (affectionate)<br>文字提示：点点野餐篮，一起搬到中间 | meadow<br>fox@actor-left/still<br>cat@actor-right/wiggle<br>basket@prop-left/still<br>flower@prop-right/still | 把野餐篮搬到中间 → basket-set：篮子移入草地中央，花留在右侧，花旁留出空地。 |
| basket-set · beat | 朵朵：谢谢你帮忙搬篮子！它到中间了，花旁也留着空地。 (cheerful)<br>文字提示：看，篮子到中间啦 | meadow<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-center/deliver<br>flower@prop-right/still | 演出结束 → choose-place |
| choose-place · interactive | 小狐狸：两个地方我也都喜欢。点花留在这里，点篮子去左边草地。 (cheerful)<br>文字提示：点花留这里，点篮子去左边 | meadow<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-center/still<br>flower@prop-right/still | 点花，篮子留在这里 → flower-end：花儿轻轻摇动，篮子留在中央靠近花，两位朋友接受花边安排。<br>点篮子，去左边草地 → grass-end：篮子移到左侧开阔草地，花留在右侧，两位朋友开心接受这个安排。 |
| flower-end · ending | 小狐狸：谢谢你帮我们选好地方！花儿轻轻点头。我们在花边小聚会吧！ (cheerful)<br>文字提示：想再选一次，也可以从头再玩。 | meadow<br>fox@actor-left/celebrate<br>cat@actor-right/celebrate<br>basket@prop-center/still<br>flower@prop-right/wiggle | 主动结束／重玩 |
| grass-end · ending | 小猫：谢谢你帮我们选好地方！篮子留在开阔草地，花也有自己的小空间。 (cheerful)<br>文字提示：想再选一次，也可以从头再玩。 | meadow<br>fox@actor-left/celebrate<br>cat@actor-right/celebrate<br>basket@prop-left/deliver<br>flower@prop-right/still | 主动结束／重玩 |

### 选择前后的实际差异

只比较 JSON 快照；动效执行、空间含义和双方同意仍需审阅。无位置变化不一定是错误，不能用动效自动证明协商成立。

| 选择 | 实际目标 / 口头提示 | 下一幕状态差异 | 作者承诺 |
|---|---|---|---|
| meet/fox → fox-wish | fox@actor-left<br>口头：小狐狸和小猫想办小聚会。先听听小狐狸吧。<br>文字标签：听听小狐狸的愿望 | fox.motion: still → wiggle | 小狐狸轻轻摇动，说想把篮子摆在花旁。 |
| fox-wish/cat → cat-wish | cat@actor-right<br>口头：我想把野餐篮摆在花旁，边吃点心边看花。点点小猫，听听它吧。<br>文字标签：点点小猫，听听它吧 | fox.motion: wiggle → still<br>cat.motion: still → wiggle | 小猫轻轻摇动，说想给花旁留一点空地，也接受两个位置。 |
| cat-wish/basket → basket-set | basket@prop-left<br>口头：花旁留点空地就好。篮子放花边、放左边草地，我都愿意。<br>文字标签：把野餐篮搬到中间 | fox.mood: neutral → happy<br>cat.mood: neutral → happy<br>cat.motion: wiggle → still<br>basket.slot: prop-left → prop-center<br>basket.motion: still → deliver | 篮子移入草地中央，花留在右侧，花旁留出空地。 |
| choose-place/flower → flower-end | flower@prop-right<br>口头：两个地方我也都喜欢。点花留在这里，点篮子去左边草地。<br>文字标签：点花，篮子留在这里 | fox.motion: still → celebrate<br>cat.motion: still → celebrate<br>flower.motion: still → wiggle | 花儿轻轻摇动，篮子留在中央靠近花，两位朋友接受花边安排。 |
| choose-place/grass → grass-end | basket@prop-center<br>口头：两个地方我也都喜欢。点花留在这里，点篮子去左边草地。<br>文字标签：点篮子，去左边草地 | fox.motion: still → celebrate<br>cat.motion: still → celebrate<br>basket.slot: prop-center → prop-left<br>basket.motion: still → deliver | 篮子移到左侧开阔草地，花留在右侧，两位朋友开心接受这个安排。 |

验收路径：
- 花边小聚会：fox → cat → basket → flower → flower-end
- 开阔草地小聚会：fox → cat → basket → grass → grass-end

## 小鼓咚咚响 (little-drum)

目标：通过听见两位角色的愿望，体验等待轮流或拍手加入两种协商方式。

依据：moe-social、naeyc-play、takacs-2015。本故事未验证学习效果；完成、重玩或尝试次数不能作为能力测评。

观察：孩子是否注意到小猫还没玩完、小狐狸也想参加？可以用动作表示，不要求复述固定话术。

| 节点 | 台词与情绪 | 场景对象 | 孩子动作与后果 |
|---|---|---|---|
| meet · interactive | 朵朵：小猫在敲小鼓，小狐狸也想玩。先听听小猫吧。 (story)<br>文字提示：点点画面，和朋友一起玩 | meadow<br>fox@actor-left/still<br>cat@actor-right/still<br>drum@prop-right/still | 听听小猫 → cat-wish：角色回应孩子的动作，故事继续。 |
| cat-wish · interactive | 小猫：我还想敲完这一小段。也听听小狐狸的想法吧。 (affectionate)<br>文字提示：点点画面，和朋友一起玩 | meadow<br>fox@actor-left/still<br>cat@actor-right/still<br>drum@prop-right/still | 听听小狐狸 → fox-wish：角色回应孩子的动作，故事继续。 |
| fox-wish · interactive | 小狐狸：我也想参加。等一小段再敲，还是先拍手一起玩？ (affectionate)<br>文字提示：等一等，或先拍手，都可以 | meadow<br>fox@actor-left/still<br>cat@actor-right/still<br>drum@prop-right/still<br>wait@prop-left/still<br>clap@prop-center/still | 等一小段再敲 → agree-wait：小猫同意敲完这一段后轮到小狐狸。<br>先拍手一起玩 → agree-clap：小猫同意敲鼓、小狐狸拍手，组成小乐队。 |
| agree-wait · beat | 小猫：好呀！我敲完这一小段，就轮到你。 (cheerful)<br>文字提示：点点画面，和朋友一起玩 | meadow<br>fox@actor-left/still<br>cat@actor-right/still<br>drum@prop-right/play | 演出结束 → pass |
| pass · interactive | 小猫：我敲完啦！把小鼓轻轻递给小狐狸吧。 (cheerful)<br>文字提示：点点小鼓，轻轻递过去 | meadow<br>fox@actor-left/still<br>cat@actor-right/still<br>drum@prop-right/still | 把小鼓递给小狐狸 → fox-turn：小猫主动结束自己的这一段，小鼓移到小狐狸面前。 |
| fox-turn · beat | 小狐狸：谢谢你把小鼓递过来！轮到我敲一小段啦。 (cheerful)<br>文字提示：点点画面，和朋友一起玩 | meadow<br>fox@actor-left/still<br>cat@actor-right/still<br>drum@prop-left/deliver | 演出结束 → tap |
| tap · interactive | 朵朵：点点小鼓，和小狐狸一起敲一小段吧！ (story)<br>文字提示：点点画面，和朋友一起玩 | meadow<br>fox@actor-left/still<br>cat@actor-right/still<br>drum@prop-left/still | 和小狐狸敲小鼓 → wait-end：角色回应孩子的动作，故事继续。 |
| wait-end · ending | 小狐狸：咚咚，咚咚！我们轮流玩，都有自己的小节奏。 (cheerful)<br>文字提示：生活里，也可以说说自己想怎么玩。 | meadow<br>fox@actor-left/celebrate<br>cat@actor-right/still<br>drum@prop-left/play | 主动结束／重玩 |
| agree-clap · interactive | 小猫：好呀，我敲鼓，你拍手！点点小手，一起试试。 (cheerful)<br>文字提示：点点小手，加入小乐队 | meadow<br>fox@actor-left/still<br>cat@actor-right/still<br>drum@prop-right/still<br>clap@prop-left/still | 一起拍手 → clap-end：小猫继续敲鼓，小狐狸拍手，两种节奏一起出现。 |
| clap-end · ending | 小狐狸：咚咚，拍拍！你敲鼓，我拍手，一起玩真开心！ (excited)<br>文字提示：也可以和家人商量一个一起玩的办法。 | meadow<br>fox@actor-left/play<br>cat@actor-right/play<br>drum@prop-right/play<br>clap@prop-left/play | 主动结束／重玩 |

### 选择前后的实际差异

只比较 JSON 快照；动效执行、空间含义和双方同意仍需审阅。无位置变化不一定是错误，不能用动效自动证明协商成立。

| 选择 | 实际目标 / 口头提示 | 下一幕状态差异 | 作者承诺 |
|---|---|---|---|
| meet/cat → cat-wish | cat@actor-right<br>口头：小猫在敲小鼓，小狐狸也想玩。先听听小猫吧。<br>文字标签：听听小猫 | 实体和背景属性无变化 | 角色回应孩子的动作，故事继续。 |
| cat-wish/fox → fox-wish | fox@actor-left<br>口头：我还想敲完这一小段。也听听小狐狸的想法吧。<br>文字标签：听听小狐狸 | 新增 wait: wait@prop-left<br>新增 clap: clap@prop-center | 角色回应孩子的动作，故事继续。 |
| fox-wish/wait → agree-wait | wait@prop-left<br>口头：我也想参加。等一小段再敲，还是先拍手一起玩？<br>文字标签：等一小段再敲 | drum.motion: still → play<br>移除 wait<br>移除 clap | 小猫同意敲完这一段后轮到小狐狸。 |
| fox-wish/clap → agree-clap | clap@prop-center<br>口头：我也想参加。等一小段再敲，还是先拍手一起玩？<br>文字标签：先拍手一起玩 | cat.mood: neutral → happy<br>clap.slot: prop-center → prop-left<br>移除 wait | 小猫同意敲鼓、小狐狸拍手，组成小乐队。 |
| pass/pass → fox-turn | drum@prop-right<br>口头：我敲完啦！把小鼓轻轻递给小狐狸吧。<br>文字标签：把小鼓递给小狐狸 | fox.mood: neutral → happy<br>cat.mood: happy → neutral<br>drum.slot: prop-right → prop-left<br>drum.motion: still → deliver | 小猫主动结束自己的这一段，小鼓移到小狐狸面前。 |
| tap/tap → wait-end | drum@prop-left<br>口头：点点小鼓，和小狐狸一起敲一小段吧！<br>文字标签：和小狐狸敲小鼓 | fox.motion: still → celebrate<br>cat.mood: neutral → happy<br>drum.motion: still → play | 角色回应孩子的动作，故事继续。 |
| agree-clap/clap-together → clap-end | clap@prop-left<br>口头：好呀，我敲鼓，你拍手！点点小手，一起试试。<br>文字标签：一起拍手 | fox.mood: neutral → happy<br>fox.motion: still → play<br>cat.motion: still → play<br>drum.motion: still → play<br>clap.motion: still → play | 小猫继续敲鼓，小狐狸拍手，两种节奏一起出现。 |

验收路径：
- 同意等待，自主交接，轮到狐狸：cat → fox → wait → pass → tap → wait-end
- 同意拍手，组成小乐队：cat → fox → clap → clap-together → clap-end

## 一起搭个小雨棚 (rain-shelter)

目标：在共同搭建玩具雨棚的过程中，体验先支撑、再覆盖的顺序与分工。

依据：moe-play、moe-social、naeyc-play。本故事未验证学习效果；完成、重玩或尝试次数不能作为能力测评。

观察：孩子是否注意到支架、棚顶和篮子的变化？是否关注小狐狸一起帮忙？

| 节点 | 台词与情绪 | 场景对象 | 孩子动作与后果 |
|---|---|---|---|
| meet · interactive | 朵朵：小雨来了，野餐篮还在外面。问问小狐狸吧！ (story)<br>文字提示：点点画面，和朋友一起玩 | rain<br>fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-right/still | 问问小狐狸 → plan：角色回应孩子的动作，故事继续。 |
| plan · interactive | 小狐狸：一起搭个小雨棚吧！先把积木支架立起来。 (affectionate)<br>文字提示：点点积木，先立起支架 | rain<br>fox@actor-left/still<br>cat@actor-right/still<br>blocks@prop-left/still<br>basket@prop-right/still | 立起积木支架 → posts-ready：支架从地面立起，小狐狸扶住它。 |
| posts-ready · beat | 小狐狸：你立起支架，我来扶稳。我们一起搭！ (cheerful)<br>文字提示：点点画面，和朋友一起玩 | rain<br>fox@actor-left/still<br>cat@actor-right/still<br>posts@prop-center/build<br>basket@prop-right/still | 演出结束 → roof |
| roof · interactive | 小狐狸：棚顶用珊瑚色，还是蓝色？都可以挡小雨。 (story)<br>文字提示：选一个喜欢的棚顶 | rain<br>fox@actor-left/still<br>cat@actor-right/still<br>posts@prop-center/still<br>roof-coral@prop-left/still<br>roof-blue@prop-right/still | 盖上珊瑚色棚顶 → coral-ready：珊瑚色棚顶落到支架上，形成雨棚。<br>盖上蓝色棚顶 → blue-ready：蓝色棚顶落到支架上，形成雨棚。 |
| coral-ready · interactive | 小狐狸：棚顶盖好啦！把篮子送进小雨棚吧。 (cheerful)<br>文字提示：点点野餐篮，送到棚下 | rain<br>fox@actor-left/still<br>cat@actor-right/still<br>shelter-coral@prop-center/build<br>basket@prop-right/still | 把篮子送进雨棚 → coral-end：篮子移到棚下，小动物在棚外开心看着。 |
| blue-ready · interactive | 小狐狸：蓝色小雨棚搭好啦！把篮子送进去吧。 (cheerful)<br>文字提示：点点野餐篮，送到棚下 | rain<br>fox@actor-left/still<br>cat@actor-right/still<br>shelter-blue@prop-center/build<br>basket@prop-right/still | 把篮子送进雨棚 → blue-end：篮子移到蓝色棚顶下，小动物庆祝共同完成。 |
| coral-end · ending | 小狐狸：你搭支架，我扶稳，篮子有地方躲雨啦！谢谢你！ (excited)<br>文字提示：生活里，也可以一起给玩具搭个小棚。 | rain<br>fox@actor-left/celebrate<br>cat@actor-right/still<br>shelter-coral-full@prop-center/still | 主动结束／重玩 |
| blue-end · ending | 小狐狸：我们一起搭好了！篮子在棚下，小雨淋不到啦！ (excited)<br>文字提示：想给这个蓝色小雨棚起个名字吗？ | rain<br>fox@actor-left/celebrate<br>cat@actor-right/still<br>shelter-blue-full@prop-center/still | 主动结束／重玩 |

### 选择前后的实际差异

只比较 JSON 快照；动效执行、空间含义和双方同意仍需审阅。无位置变化不一定是错误，不能用动效自动证明协商成立。

| 选择 | 实际目标 / 口头提示 | 下一幕状态差异 | 作者承诺 |
|---|---|---|---|
| meet/ask → plan | fox@actor-left<br>口头：小雨来了，野餐篮还在外面。问问小狐狸吧！<br>文字标签：问问小狐狸 | 新增 blocks: blocks@prop-left | 角色回应孩子的动作，故事继续。 |
| plan/posts → posts-ready | blocks@prop-left<br>口头：一起搭个小雨棚吧！先把积木支架立起来。<br>文字标签：立起积木支架 | 新增 posts: posts@prop-center<br>移除 blocks | 支架从地面立起，小狐狸扶住它。 |
| roof/coral → coral-ready | roof-coral@prop-left<br>口头：棚顶用珊瑚色，还是蓝色？都可以挡小雨。<br>文字标签：盖上珊瑚色棚顶 | 新增 shelter: shelter-coral@prop-center<br>新增 basket: basket@prop-right<br>移除 posts<br>移除 coral<br>移除 blue | 珊瑚色棚顶落到支架上，形成雨棚。 |
| roof/blue → blue-ready | roof-blue@prop-right<br>口头：棚顶用珊瑚色，还是蓝色？都可以挡小雨。<br>文字标签：盖上蓝色棚顶 | 新增 shelter: shelter-blue@prop-center<br>新增 basket: basket@prop-right<br>移除 posts<br>移除 coral<br>移除 blue | 蓝色棚顶落到支架上，形成雨棚。 |
| coral-ready/basket → coral-end | basket@prop-right<br>口头：棚顶盖好啦！把篮子送进小雨棚吧。<br>文字标签：把篮子送进雨棚 | fox.mood: neutral → happy<br>fox.motion: still → celebrate<br>cat.mood: neutral → happy<br>shelter.asset: shelter-coral → shelter-coral-full<br>shelter.motion: build → still<br>移除 basket | 篮子移到棚下，小动物在棚外开心看着。 |
| blue-ready/basket → blue-end | basket@prop-right<br>口头：蓝色小雨棚搭好啦！把篮子送进去吧。<br>文字标签：把篮子送进雨棚 | fox.mood: neutral → happy<br>fox.motion: still → celebrate<br>cat.mood: neutral → happy<br>shelter.asset: shelter-blue → shelter-blue-full<br>shelter.motion: build → still<br>移除 basket | 篮子移到蓝色棚顶下，小动物庆祝共同完成。 |

验收路径：
- 珊瑚色雨棚：ask → posts → coral → basket → coral-end
- 蓝色雨棚：ask → posts → blue → basket → blue-end

## 雪松下的小手套 (snow-mittens)

目标：在帮助小熊的情境中，观察手套的花纹是否相同。

依据：moe-play、naeyc-play、takacs-2015。本故事未验证学习效果；完成、重玩或尝试次数不能作为能力测评。

观察：孩子是否看过小熊手上的线索？能否通过语言或动作表示手套让小熊暖和了？

| 节点 | 台词与情绪 | 场景对象 | 孩子动作与后果 |
|---|---|---|---|
| meet · interactive | 朵朵：小熊少了一只手套。点点它，问问怎么啦？ (story)<br>文字提示：点点画面，和朋友一起玩 | snow<br>bear-cold@actor-left/still<br>rabbit@actor-right/still | 问问小熊 → search：角色回应孩子的动作，故事继续。 |
| search · interactive | 小熊：手套落在雪松旁了。帮我找找吧！ (affectionate)<br>文字提示：点点积雪，也可以看看雪松 | snow<br>bear-cold@actor-left/still<br>rabbit@actor-right/still<br>snow@prop-center/still<br>pine@prop-right/still | 拨开积雪 → match：角色回应孩子的动作，故事继续。<br>看看雪松 → bird：小鸟从树旁飞出，指向积雪。 |
| bird · beat | 朵朵：小鸟飞出来啦！它指着那堆雪呢！ (cheerful)<br>文字提示：点点画面，和朋友一起玩 | snow<br>bear-cold@actor-left/still<br>rabbit@actor-right/still<br>snow@prop-center/still<br>bird@sky-right/arrive | 演出结束 → search-clue |
| search-clue · interactive | 朵朵：雪里露出了一角，拨开看看吧！ (story)<br>文字提示：点点画面，和朋友一起玩 | snow<br>bear-cold@actor-left/still<br>rabbit@actor-right/still<br>snow@prop-center/still | 拨开积雪 → match：角色回应孩子的动作，故事继续。 |
| match · interactive | 小熊：我戴的是红色条纹手套。把一样的送给我吧！ (story)<br>文字提示：看看小熊的手套，再点点一样的 | snow<br>bear-cold@actor-left/still<br>rabbit@actor-right/still<br>mitten-stripe@prop-right/still<br>mitten-dot@prop-left/still | 送红色条纹手套 → thanks：小熊收到配对手套，手暖和起来。<br>送蓝色圆点手套 → hint：描述圆点与条纹的区别，允许再找。 |
| hint · beat | 朵朵：这只是蓝色圆点的。再看看小熊的红色条纹吧。 (empathetic)<br>文字提示：点点画面，和朋友一起玩 | snow<br>bear-cold@actor-left/still<br>rabbit@actor-right/still<br>mitten-stripe@prop-right/still<br>mitten-dot@prop-left/still | 演出结束 → match |
| thanks · beat | 小熊：你找到一样的条纹啦！手暖和了，谢谢你！ (excited)<br>文字提示：点点画面，和朋友一起玩 | snow<br>bear-warm@actor-left/celebrate<br>rabbit@actor-right/still<br>mitten-stripe@prop-left/deliver | 演出结束 → play |
| play · interactive | 小熊：一起堆雪人，还是踩脚印？你来选！ (cheerful)<br>文字提示：堆雪人、踩脚印，都可以 | snow<br>bear-warm@actor-left/celebrate<br>rabbit@actor-right/still<br>snowman@prop-left/still<br>footprints@prop-right/still | 一起堆雪人 → snowman-end：小熊和孩子一起堆起雪人。<br>一起踩脚印 → prints-end：雪地留下大小脚印，两位朋友一起走。 |
| snowman-end · ending | 小熊：小雪人堆好啦！和你一起玩，真开心！ (excited)<br>文字提示：想说说你帮了小熊什么吗？ | snow<br>bear-warm@actor-left/celebrate<br>rabbit@actor-right/still<br>snowman@prop-center/build | 主动结束／重玩 |
| prints-end · ending | 小熊：一串大脚印，一串小脚印！一起走吧！ (cheerful)<br>文字提示：也可以和家人一起找找生活里的脚印。 | snow<br>bear-warm@actor-left/celebrate<br>rabbit@actor-right/arrive<br>footprints@prop-center/arrive | 主动结束／重玩 |

### 选择前后的实际差异

只比较 JSON 快照；动效执行、空间含义和双方同意仍需审阅。无位置变化不一定是错误，不能用动效自动证明协商成立。

| 选择 | 实际目标 / 口头提示 | 下一幕状态差异 | 作者承诺 |
|---|---|---|---|
| meet/ask → search | bear-cold@actor-left<br>口头：小熊少了一只手套。点点它，问问怎么啦？<br>文字标签：问问小熊 | 新增 snow: snow@prop-center<br>新增 pine: pine@prop-right | 角色回应孩子的动作，故事继续。 |
| search/snow → match | snow@prop-center<br>口头：手套落在雪松旁了。帮我找找吧！<br>文字标签：拨开积雪 | 新增 red: mitten-stripe@prop-right<br>新增 blue: mitten-dot@prop-left<br>移除 snow<br>移除 pine | 角色回应孩子的动作，故事继续。 |
| search/pine → bird | pine@prop-right<br>口头：手套落在雪松旁了。帮我找找吧！<br>文字标签：看看雪松 | 新增 bird: bird@sky-right<br>移除 pine | 小鸟从树旁飞出，指向积雪。 |
| search-clue/snow → match | snow@prop-center<br>口头：雪里露出了一角，拨开看看吧！<br>文字标签：拨开积雪 | 新增 red: mitten-stripe@prop-right<br>新增 blue: mitten-dot@prop-left<br>移除 snow | 角色回应孩子的动作，故事继续。 |
| match/red → thanks | mitten-stripe@prop-right<br>口头：我戴的是红色条纹手套。把一样的送给我吧！<br>文字标签：送红色条纹手套 | bear.asset: bear-cold → bear-warm<br>bear.mood: neutral → happy<br>bear.motion: still → celebrate<br>新增 delivered: mitten-stripe@prop-left<br>移除 red<br>移除 blue | 小熊收到配对手套，手暖和起来。 |
| match/blue → hint | mitten-dot@prop-left<br>口头：我戴的是红色条纹手套。把一样的送给我吧！<br>文字标签：送蓝色圆点手套 | 实体和背景属性无变化 | 描述圆点与条纹的区别，允许再找。 |
| play/snowman → snowman-end | snowman@prop-left<br>口头：一起堆雪人，还是踩脚印？你来选！<br>文字标签：一起堆雪人 | rabbit.mood: neutral → happy<br>snowman.slot: prop-left → prop-center<br>snowman.motion: still → build<br>移除 prints | 小熊和孩子一起堆起雪人。 |
| play/prints → prints-end | footprints@prop-right<br>口头：一起堆雪人，还是踩脚印？你来选！<br>文字标签：一起踩脚印 | rabbit.mood: neutral → happy<br>rabbit.motion: still → arrive<br>prints.slot: prop-right → prop-center<br>prints.motion: still → arrive<br>移除 snowman | 雪地留下大小脚印，两位朋友一起走。 |

验收路径：
- 直接找到，堆雪人：ask → snow → red → snowman → snowman-end
- 探索小鸟，尝试圆点后重找，踩脚印：ask → pine → snow → blue → red → prints → prints-end

