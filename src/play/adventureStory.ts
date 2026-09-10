export type AdventureStage =
  | 'welcome'
  | 'meet'
  | 'search'
  | 'bird'
  | 'match'
  | 'thanks'
  | 'choose-play'
  | 'snowman'
  | 'footprints'
  | 'ending'
export type AdventureAction =
  | 'start'
  | 'bear'
  | 'snow'
  | 'pine'
  | 'stripe'
  | 'dot'
  | 'snowman'
  | 'footprints'
  | 'build'
  | 'walk'
  | 'settled'
export interface AdventureState {
  stage: AdventureStage
  birdSeen: boolean
  wrong: boolean
  attempts: number
  ending: 'snowman' | 'footprints' | null
}
export const adventureInitial: AdventureState = {
  stage: 'welcome',
  birdSeen: false,
  wrong: false,
  attempts: 0,
  ending: null,
}
export function adventureReducer(
  state: AdventureState,
  action: AdventureAction,
): AdventureState {
  if (
    action === 'start' &&
    (state.stage === 'welcome' || state.stage === 'ending')
  )
    return { ...adventureInitial, stage: 'meet' }
  if (state.stage === 'meet' && action === 'bear')
    return { ...state, stage: 'search' }
  if (state.stage === 'search' && action === 'pine' && !state.birdSeen)
    return { ...state, stage: 'bird', birdSeen: true }
  if (state.stage === 'bird' && action === 'settled')
    return { ...state, stage: 'search' }
  if (state.stage === 'search' && action === 'snow')
    return { ...state, stage: 'match' }
  if (state.stage === 'match' && (action === 'stripe' || action === 'dot'))
    return {
      ...state,
      stage: action === 'stripe' ? 'thanks' : 'match',
      wrong: action === 'dot',
      attempts: state.attempts + 1,
    }
  if (state.stage === 'thanks' && action === 'settled')
    return { ...state, stage: 'choose-play' }
  if (
    state.stage === 'choose-play' &&
    (action === 'snowman' || action === 'footprints')
  )
    return { ...state, stage: action, ending: action }
  if (
    (state.stage === 'snowman' && action === 'build') ||
    (state.stage === 'footprints' && action === 'walk')
  )
    return { ...state, stage: 'ending' }
  return state
}

export type VoiceStyle =
  | 'story'
  | 'affectionate'
  | 'cheerful'
  | 'excited'
  | 'empathetic'
export interface AdventureLine {
  speaker: string
  text: string
  style: VoiceStyle
  cue: string
}
export const adventureLines: Record<string, AdventureLine> = {
  meet: {
    speaker: '朵朵警官',
    text: '咦，小熊在搓手。点点它，问问怎么啦？',
    style: 'story',
    cue: '点点小熊，听它说一说',
  },
  search: {
    speaker: '小熊',
    text: '我的手套落在雪松旁了。帮我找找好吗？',
    style: 'affectionate',
    cue: '雪松旁边，哪里藏着小线索？',
  },
  bird: {
    speaker: '朵朵警官',
    text: '小鸟飞出来啦！它指着那堆雪呢！',
    style: 'cheerful',
    cue: '小鸟发现了什么？',
  },
  'search-after-bird': {
    speaker: '朵朵警官',
    text: '雪里露出了小小的一角。点开看看吧！',
    style: 'story',
    cue: '点点积雪，轻轻拨开它',
  },
  match: {
    speaker: '小熊',
    text: '我的手套是红色条纹的。把一样的送给我吧！',
    style: 'cheerful',
    cue: '点点和小熊手上一样的手套',
  },
  hint: {
    speaker: '朵朵警官',
    text: '这只是蓝色圆点的。再找找红色条纹吧。',
    style: 'empathetic',
    cue: '看看小熊手上的红色条纹',
  },
  thanks: {
    speaker: '小熊',
    text: '你真棒！我的手暖和啦，谢谢你！',
    style: 'excited',
    cue: '看，小熊戴上手套啦！',
  },
  'choose-play': {
    speaker: '小熊',
    text: '一起堆雪人，还是踩脚印？你来选！',
    style: 'cheerful',
    cue: '堆雪人，还是踩脚印？都可以哦',
  },
  snowman: {
    speaker: '小熊',
    text: '点点小雪球，我们一起堆雪人！',
    style: 'cheerful',
    cue: '点点小雪球，一起堆起来',
  },
  footprints: {
    speaker: '小熊',
    text: '点点前面的雪地，和我一起踩脚印吧！',
    style: 'cheerful',
    cue: '点点雪地，一起向前走',
  },
  'ending-snowman': {
    speaker: '小熊',
    text: '太厉害了！我们的小雪人会笑啦！和你一起玩，真开心！',
    style: 'excited',
    cue: '一个暖暖的帮助，换来一起玩的快乐',
  },
  'ending-footprints': {
    speaker: '小熊',
    text: '一串大脚印，一串小脚印！和你一起走，真开心！',
    style: 'affectionate',
    cue: '雪地记住了我们的好朋友时光',
  },
}
export function adventureLine(state: AdventureState): AdventureLine {
  const key =
    state.stage === 'ending'
      ? `ending-${state.ending}`
      : state.stage === 'match' && state.wrong
        ? 'hint'
        : state.stage === 'search' && state.birdSeen
          ? 'search-after-bird'
          : state.stage
  return adventureLines[key] ?? adventureLines.meet!
}
