# 三种故事样板的审阅分镜

由 `npm run stories:review` 从故事 JSON 生成。表格帮助人工核对，不代表内容质量自动通过。

## 小鼓咚咚响 (little-drum)

目标：通过听见两位角色的愿望，体验等待轮流或拍手加入两种协商方式。

依据：moe-social、naeyc-play、takacs-2015。本故事未验证学习效果；完成、重玩或尝试次数不能作为能力测评。

观察：孩子是否注意到小猫还没玩完、小狐狸也想参加？可以用动作表示，不要求复述固定话术。

| 节点 | 台词与情绪 | 场景对象 | 孩子动作与后果 |
|---|---|---|---|
| meet · interactive | 朵朵：小猫在敲小鼓，小狐狸也想玩。先听听小猫吧。 (story) | fox@actor-left/still<br>cat@actor-right/still<br>drum@prop-right/still | 听听小猫 → cat-wish：角色回应孩子的动作，故事继续。 |
| cat-wish · interactive | 小猫：我还想敲完这一小段。也听听小狐狸的想法吧。 (affectionate) | fox@actor-left/still<br>cat@actor-right/still<br>drum@prop-right/still | 听听小狐狸 → fox-wish：角色回应孩子的动作，故事继续。 |
| fox-wish · interactive | 小狐狸：我也想参加。等一小段再敲，还是先拍手一起玩？ (affectionate) | fox@actor-left/still<br>cat@actor-right/still<br>drum@prop-right/still<br>wait@prop-left/still<br>clap@prop-center/still | 等一小段再敲 → agree-wait：小猫同意敲完这一段后轮到小狐狸。<br>先拍手一起玩 → agree-clap：小猫同意敲鼓、小狐狸拍手，组成小乐队。 |
| agree-wait · beat | 小猫：好呀！我敲完这一小段，就轮到你。 (cheerful) | fox@actor-left/still<br>cat@actor-right/still<br>drum@prop-right/play | 演出结束 → pass |
| pass · interactive | 小猫：我敲完啦！把小鼓轻轻递给小狐狸吧。 (cheerful) | fox@actor-left/still<br>cat@actor-right/still<br>drum@prop-right/still | 把小鼓递给小狐狸 → fox-turn：小猫主动结束自己的这一段，小鼓移到小狐狸面前。 |
| fox-turn · beat | 小狐狸：谢谢你把小鼓递过来！轮到我敲一小段啦。 (cheerful) | fox@actor-left/still<br>cat@actor-right/still<br>drum@prop-left/deliver | 演出结束 → tap |
| tap · interactive | 朵朵：点点小鼓，和小狐狸一起敲一小段吧！ (story) | fox@actor-left/still<br>cat@actor-right/still<br>drum@prop-left/still | 和小狐狸敲小鼓 → wait-end：角色回应孩子的动作，故事继续。 |
| wait-end · ending | 小狐狸：咚咚，咚咚！我们轮流玩，都有自己的小节奏。 (cheerful) | fox@actor-left/celebrate<br>cat@actor-right/still<br>drum@prop-left/play | 主动结束／重玩 |
| agree-clap · interactive | 小猫：好呀，我敲鼓，你拍手！点点小手，一起试试。 (cheerful) | fox@actor-left/still<br>cat@actor-right/still<br>drum@prop-right/still<br>clap@prop-left/still | 一起拍手 → clap-end：小猫继续敲鼓，小狐狸拍手，两种节奏一起出现。 |
| clap-end · ending | 小狐狸：咚咚，拍拍！你敲鼓，我拍手，一起玩真开心！ (excited) | fox@actor-left/play<br>cat@actor-right/play<br>drum@prop-right/play<br>clap@prop-left/play | 主动结束／重玩 |

验收路径：
- 同意等待，自主交接，轮到狐狸：cat → fox → wait → pass → tap → wait-end
- 同意拍手，组成小乐队：cat → fox → clap → clap-together → clap-end

## 一起搭个小雨棚 (rain-shelter)

目标：在共同搭建玩具雨棚的过程中，体验先支撑、再覆盖的顺序与分工。

依据：moe-play、moe-social、naeyc-play。本故事未验证学习效果；完成、重玩或尝试次数不能作为能力测评。

观察：孩子是否注意到支架、棚顶和篮子的变化？是否关注小狐狸一起帮忙？

| 节点 | 台词与情绪 | 场景对象 | 孩子动作与后果 |
|---|---|---|---|
| meet · interactive | 朵朵：小雨来了，野餐篮还在外面。问问小狐狸吧！ (story) | fox@actor-left/still<br>cat@actor-right/still<br>basket@prop-right/still | 问问小狐狸 → plan：角色回应孩子的动作，故事继续。 |
| plan · interactive | 小狐狸：一起搭个小雨棚吧！先把积木支架立起来。 (affectionate) | fox@actor-left/still<br>cat@actor-right/still<br>blocks@prop-left/still<br>basket@prop-right/still | 立起积木支架 → posts-ready：支架从地面立起，小狐狸扶住它。 |
| posts-ready · beat | 小狐狸：你立起支架，我来扶稳。我们一起搭！ (cheerful) | fox@actor-left/still<br>cat@actor-right/still<br>posts@prop-center/build<br>basket@prop-right/still | 演出结束 → roof |
| roof · interactive | 小狐狸：棚顶用珊瑚色，还是蓝色？都可以挡小雨。 (story) | fox@actor-left/still<br>cat@actor-right/still<br>posts@prop-center/still<br>roof-coral@prop-left/still<br>roof-blue@prop-right/still | 盖上珊瑚色棚顶 → coral-ready：珊瑚色棚顶落到支架上，形成雨棚。<br>盖上蓝色棚顶 → blue-ready：蓝色棚顶落到支架上，形成雨棚。 |
| coral-ready · interactive | 小狐狸：棚顶盖好啦！把篮子送进小雨棚吧。 (cheerful) | fox@actor-left/still<br>cat@actor-right/still<br>shelter-coral@prop-center/build<br>basket@prop-right/still | 把篮子送进雨棚 → coral-end：篮子移到棚下，小动物在棚外开心看着。 |
| blue-ready · interactive | 小狐狸：蓝色小雨棚搭好啦！把篮子送进去吧。 (cheerful) | fox@actor-left/still<br>cat@actor-right/still<br>shelter-blue@prop-center/build<br>basket@prop-right/still | 把篮子送进雨棚 → blue-end：篮子移到蓝色棚顶下，小动物庆祝共同完成。 |
| coral-end · ending | 小狐狸：你搭支架，我扶稳，篮子有地方躲雨啦！谢谢你！ (excited) | fox@actor-left/celebrate<br>cat@actor-right/still<br>shelter-coral-full@prop-center/still | 主动结束／重玩 |
| blue-end · ending | 小狐狸：我们一起搭好了！篮子在棚下，小雨淋不到啦！ (excited) | fox@actor-left/celebrate<br>cat@actor-right/still<br>shelter-blue-full@prop-center/still | 主动结束／重玩 |

验收路径：
- 珊瑚色雨棚：ask → posts → coral → basket → coral-end
- 蓝色雨棚：ask → posts → blue → basket → blue-end

## 雪松下的小手套 (snow-mittens)

目标：在帮助小熊的情境中，观察手套的花纹是否相同。

依据：moe-play、naeyc-play、takacs-2015。本故事未验证学习效果；完成、重玩或尝试次数不能作为能力测评。

观察：孩子是否看过小熊手上的线索？能否通过语言或动作表示手套让小熊暖和了？

| 节点 | 台词与情绪 | 场景对象 | 孩子动作与后果 |
|---|---|---|---|
| meet · interactive | 朵朵：小熊少了一只手套。点点它，问问怎么啦？ (story) | bear-cold@actor-left/still<br>rabbit@actor-right/still | 问问小熊 → search：角色回应孩子的动作，故事继续。 |
| search · interactive | 小熊：手套落在雪松旁了。帮我找找吧！ (affectionate) | bear-cold@actor-left/still<br>rabbit@actor-right/still<br>snow@prop-center/still<br>pine@prop-right/still | 拨开积雪 → match：角色回应孩子的动作，故事继续。<br>看看雪松 → bird：小鸟从树旁飞出，指向积雪。 |
| bird · beat | 朵朵：小鸟飞出来啦！它指着那堆雪呢！ (cheerful) | bear-cold@actor-left/still<br>rabbit@actor-right/still<br>snow@prop-center/still<br>bird@sky-right/arrive | 演出结束 → search-clue |
| search-clue · interactive | 朵朵：雪里露出了一角，拨开看看吧！ (story) | bear-cold@actor-left/still<br>rabbit@actor-right/still<br>snow@prop-center/still | 拨开积雪 → match：角色回应孩子的动作，故事继续。 |
| match · interactive | 小熊：我戴的是红色条纹手套。把一样的送给我吧！ (story) | bear-cold@actor-left/still<br>rabbit@actor-right/still<br>mitten-stripe@prop-right/still<br>mitten-dot@prop-left/still | 送红色条纹手套 → thanks：小熊收到配对手套，手暖和起来。<br>送蓝色圆点手套 → hint：描述圆点与条纹的区别，允许再找。 |
| hint · beat | 朵朵：这只是蓝色圆点的。再看看小熊的红色条纹吧。 (empathetic) | bear-cold@actor-left/still<br>rabbit@actor-right/still<br>mitten-stripe@prop-right/still<br>mitten-dot@prop-left/still | 演出结束 → match |
| thanks · beat | 小熊：你找到一样的条纹啦！手暖和了，谢谢你！ (excited) | bear-warm@actor-left/celebrate<br>rabbit@actor-right/still<br>mitten-stripe@prop-left/deliver | 演出结束 → play |
| play · interactive | 小熊：一起堆雪人，还是踩脚印？你来选！ (cheerful) | bear-warm@actor-left/celebrate<br>rabbit@actor-right/still<br>snowman@prop-left/still<br>footprints@prop-right/still | 一起堆雪人 → snowman-end：小熊和孩子一起堆起雪人。<br>一起踩脚印 → prints-end：雪地留下大小脚印，两位朋友一起走。 |
| snowman-end · ending | 小熊：小雪人堆好啦！和你一起玩，真开心！ (excited) | bear-warm@actor-left/celebrate<br>rabbit@actor-right/still<br>snowman@prop-center/build | 主动结束／重玩 |
| prints-end · ending | 小熊：一串大脚印，一串小脚印！一起走吧！ (cheerful) | bear-warm@actor-left/celebrate<br>rabbit@actor-right/arrive<br>footprints@prop-center/arrive | 主动结束／重玩 |

验收路径：
- 直接找到，堆雪人：ask → snow → red → snowman → snowman-end
- 探索小鸟，尝试圆点后重找，踩脚印：ask → pine → snow → blue → red → prints → prints-end

