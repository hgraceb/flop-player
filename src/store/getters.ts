import { State } from '@/store/state'
import { MIN_WIDTH } from '@/game/constants'

export const getters = {
  /** 录像是否处于暂停状态 */
  isVideoPaused: (state: State): boolean => {
    return state.videoAnimationId === 0
  },
  /** 玩家当前是否正在游戏，如：UPK */
  isUserPlaying: (state: State): boolean => {
    return state.gameType !== 'Video' && state.videoAnimationId !== 0
  },
  /** 获取当前游戏真实时间（秒） */
  getRealTime: (state: State): number => {
    // 如果当前是播放录像，则计数器时间最大为最后一个游戏事件的时间
    if (state.gameType === 'Video') {
      return Math.min(state.gameEvents[state.gameEvents.length - 1]?.time || 0, state.gameElapsedTime) / 1000
    }
    return state.gameElapsedTime / 1000
  },
  /** 获取页面实际显示的宽度 */
  getDisplayWidth: (state: State): number => {
    return state.width > MIN_WIDTH ? state.width : MIN_WIDTH
  }
}

export type Getters = typeof getters
