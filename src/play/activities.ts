export interface ActivityRound {
  prompt: string
  hint: string
  success: string
  choices: [string, string]
  target: string
}
export interface Activity {
  id: string
  title: string
  skill: string
  age: string
  intro: string
  rounds: [ActivityRound, ActivityRound, ActivityRound]
  ending: string
  offline: string
  parent: string
  cover: string
}
export const activities: Activity[] = [
  {
    id: 'picnic',
    title: '野餐准备好啦',
    skill: '比较大小',
    age: '2.5–4 岁',
    cover: 'big-bowl',
    intro: '小熊要去野餐啦。我们来帮忙，找找大大的、小小的东西。',
    rounds: [
      {
        prompt: '小熊想用大碗。点一点大碗吧。',
        hint: '两个碗放在一起，哪一个占的地方更大呢？',
        success: '你真棒！谢谢你帮小熊找到大碗！',
        choices: ['small-bowl', 'big-bowl'],
        target: 'big-bowl',
      },
      {
        prompt: '小猫想用小杯子。点一点小杯子吧。',
        hint: '看看两个杯子，找找小小的那一个。',
        success: '太棒啦！小猫有杯子喝水了！',
        choices: ['small-cup', 'big-cup'],
        target: 'small-cup',
      },
      {
        prompt: '还要一块大野餐垫。点一点大垫子吧。',
        hint: '哪一块垫子能坐下更多小伙伴呢？',
        success: '太厉害了！大家能坐在一起啦！',
        choices: ['big-mat', 'small-mat'],
        target: 'big-mat',
      },
    ],
    ending:
      '野餐准备好啦！谢谢你。和爸爸妈妈找两个大小不同的杯子，指一指大杯子和小杯子吧。',
    offline: '拿两个大小不同的杯子，请孩子指一指大的、再指一指小的。',
    parent:
      '同一种物品只改变大小。先让孩子比较，不用提前说答案；“大”和“小”都体验一次。',
  },
  {
    id: 'hide',
    title: '小球在哪里',
    skill: '听懂位置',
    age: '2.5–4 岁 · 可先陪做',
    cover: 'ball-in',
    intro: '小猫要收好小球。我们一起找找，小球在哪里。',
    rounds: [
      {
        prompt: '点一点，盒子里面的小球。',
        hint: '小球躲进盒子里啦。看看盒子里有没有小球。',
        success: '你真棒！小球就在盒子里面！',
        choices: ['ball-out', 'ball-in'],
        target: 'ball-in',
      },
      {
        prompt: '点一点，凳子上面的小球。',
        hint: '看看凳子的座位，小球坐在上面呢。',
        success: '找到了！你看得真仔细！',
        choices: ['ball-on', 'ball-under'],
        target: 'ball-on',
      },
      {
        prompt: '点一点，凳子下面的小球。',
        hint: '往凳子腿中间看看，小球躲在下面。',
        success: '找齐啦！谢谢你帮助小猫！',
        choices: ['ball-on', 'ball-under'],
        target: 'ball-under',
      },
    ],
    ending:
      '小球找齐啦！现在拿一个真的玩具和盒子，和爸爸妈妈试试，把玩具放到盒子里面吧。',
    offline: '拿玩具和盒子，说“放到里面”。如果孩子愿意，再试试“放到凳子下面”。',
    parent:
      '先只说位置，不指正确的图。没听懂时，可以用身边的盒子演示一次，再回来试。',
  },
  {
    id: 'garden',
    title: '小花喝水啦',
    skill: '生活中的先后',
    age: '3–4 岁 · 小一点可陪做',
    cover: 'water',
    intro: '小熊种了一盆小花。土干干的。我们一起给小花浇水吧。',
    rounds: [
      {
        prompt: '要给花浇水，拿哪一个呢？',
        hint: '找找能装水、能把水倒出来的东西。',
        success: '你真棒！拿到水壶啦！',
        choices: ['pillow', 'can'],
        target: 'can',
      },
      {
        prompt: '水壶空空的。先给水壶装水吧。',
        hint: '空水壶还没有水。找找正在装水的那张图。',
        success: '太好了！可以给小花喝水啦！',
        choices: ['fill', 'water'],
        target: 'fill',
      },
      {
        prompt: '水装好啦。现在给小花浇水吧。',
        hint: '把水轻轻倒在花盆的土里。',
        success: '小花喝到水啦！谢谢你照顾它！',
        choices: ['fill', 'water'],
        target: 'water',
      },
    ],
    ending:
      '小花喝到水啦。和爸爸妈妈照顾一盆真的植物吧。先装一点水，再慢慢浇到土里。',
    offline: '大人确认植物需要水后，和孩子一起：装一点水，再浇到土里。',
    parent:
      '这是熟悉生活流程的尝试，步骤条保留已完成的步骤作为提示。孩子不熟悉浇花时，大人先示范即可。',
  },
]
export const itemNames: Record<string, string> = {
  'small-bowl': '小碗',
  'big-bowl': '大碗',
  'small-cup': '小杯子',
  'big-cup': '大杯子',
  'big-mat': '大垫子',
  'small-mat': '小垫子',
  'ball-in': '盒子里面的小球',
  'ball-out': '盒子外面的小球',
  'ball-on': '凳子上面的小球',
  'ball-under': '凳子下面的小球',
  pillow: '枕头',
  can: '水壶',
  fill: '给水壶装水',
  water: '给小花浇水',
}
export interface ActivityState {
  phase: 'welcome' | 'playing' | 'success' | 'finished' | 'goodbye'
  round: number
  wrong: string | null
  attempts: number[]
  completed: number
}
export type ActivityEvent =
  | { type: 'start' }
  | { type: 'choose'; item: string }
  | { type: 'next' }
  | { type: 'close' }
export function newActivityState(activity: Activity): ActivityState {
  return {
    phase: 'welcome',
    round: 0,
    wrong: null,
    completed: 0,
    attempts: activity.rounds.map(() => 0),
  }
}
export function advance(
  activity: Activity,
  state: ActivityState,
  event: ActivityEvent,
): ActivityState {
  if (event.type === 'start')
    return { ...newActivityState(activity), phase: 'playing' }
  if (event.type === 'close') return { ...state, phase: 'goodbye' }
  const round = activity.rounds[state.round] ?? activity.rounds[0]
  if (
    event.type === 'choose' &&
    state.phase === 'playing' &&
    round.choices.includes(event.item)
  ) {
    return {
      ...state,
      completed: state.completed + (event.item === round.target ? 1 : 0),
      phase: event.item === round.target ? 'success' : 'playing',
      wrong: event.item === round.target ? null : event.item,
      attempts: state.attempts.map((n, i) => (i === state.round ? n + 1 : n)),
    }
  }
  if (event.type === 'next' && state.phase === 'success') {
    return state.round === activity.rounds.length - 1
      ? { ...state, phase: 'finished' }
      : { ...state, round: state.round + 1, phase: 'playing', wrong: null }
  }
  return state
}
export function activityNarration(
  activity: Activity,
  state: ActivityState,
): string {
  if (state.phase === 'welcome') return activity.intro
  if (state.phase === 'finished') return activity.ending
  if (state.phase === 'goodbye')
    return '今天先玩到这里。谢谢你帮忙，我们下次见！'
  const round = activity.rounds[state.round] ?? activity.rounds[0]
  return state.phase === 'success'
    ? round.success
    : state.wrong
      ? round.hint
      : round.prompt
}
