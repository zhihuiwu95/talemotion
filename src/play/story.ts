export type MittenKind = 'stripe' | 'dot' | 'star'
export type Phase = 'welcome' | 'playing' | 'matched' | 'finished' | 'goodbye'
export interface StoryState {
  phase: Phase
  round: number
  wrong: MittenKind | null
  attempts: number[]
  found: number
}
export type StoryEvent =
  | { type: 'start' }
  | { type: 'choose'; kind: MittenKind }
  | { type: 'next' }
  | { type: 'close' }

export const mittens: Record<
  MittenKind,
  { name: string; color: string; dark: string; detail: string }
> = {
  stripe: {
    name: '红色条纹手套',
    color: '#ed846b',
    dark: '#b95342',
    detail: '红红的，还有一道道条纹',
  },
  dot: {
    name: '蓝色圆点手套',
    color: '#77b9cf',
    dark: '#3c809c',
    detail: '蓝蓝的，还有圆圆的点点',
  },
  star: {
    name: '黄色星星手套',
    color: '#efbd53',
    dark: '#b1802a',
    detail: '黄黄的，还有一颗星星',
  },
}
interface Round {
  friend: string
  animal: 'bear' | 'fox' | 'cat'
  target: MittenKind
  choices: MittenKind[]
}
export const rounds: [Round, Round, Round] = [
  {
    friend: '小熊',
    animal: 'bear',
    target: 'stripe',
    choices: ['dot', 'stripe'],
  },
  { friend: '小狐狸', animal: 'fox', target: 'dot', choices: ['dot', 'star'] },
  {
    friend: '小猫',
    animal: 'cat',
    target: 'star',
    choices: ['stripe', 'star'],
  },
]
export const initialState: StoryState = {
  phase: 'welcome',
  round: 0,
  wrong: null,
  attempts: [0, 0, 0],
  found: 0,
}
export function storyReducer(state: StoryState, event: StoryEvent): StoryState {
  if (event.type === 'start')
    return { ...initialState, phase: 'playing', attempts: [0, 0, 0], found: 0 }
  if (event.type === 'close') return { ...state, phase: 'goodbye' }
  if (event.type === 'choose' && state.phase === 'playing') {
    const round = rounds[state.round] ?? rounds[0]
    if (!round.choices.includes(event.kind)) return state
    const attempts = state.attempts.map((n, i) =>
      i === state.round ? n + 1 : n,
    )
    return event.kind === round.target
      ? {
          ...state,
          phase: 'matched',
          wrong: null,
          attempts,
          found: state.found + 1,
        }
      : { ...state, wrong: event.kind, attempts }
  }
  if (event.type === 'next' && state.phase === 'matched') {
    return state.round === rounds.length - 1
      ? { ...state, phase: 'finished' }
      : { ...state, phase: 'playing', round: state.round + 1, wrong: null }
  }
  return state
}

export function narration(state: StoryState): string {
  const round = rounds[state.round] ?? rounds[0]
  if (state.phase === 'welcome')
    return '你好，我是朵朵警官。小伙伴的手套混在一起啦。一起帮手套找朋友吧！'
  if (state.phase === 'goodbye')
    return '今天先玩到这里。谢谢你帮忙，我们下次见！'
  if (state.phase === 'finished')
    return '大家的手套都找齐啦！谢谢你。现在，和爸爸妈妈找一双真的袜子，帮它们也配成一对吧！'
  if (state.phase === 'matched')
    return `找到啦！两只一样的手套，正好是一对。送给${round.friend}吧！`
  if (state.wrong)
    return `这两只不一样。看看${round.friend}的手套，${mittens[round.target].detail}。再找找吧。`
  return `${round.friend}有一只手套。哪一只和它一样呢？点一点吧。`
}
