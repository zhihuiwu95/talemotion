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

