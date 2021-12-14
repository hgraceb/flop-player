import { State } from '@/store/state'
import { MIN_WIDTH, SQUARE_SIZE } from '@/game/constants'

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
  /** 获取游戏主要区域宽度 */
  getMainWidth: (state: State): number => {
    const width = state.width * state.squareSize
    return width > MIN_WIDTH ? width : MIN_WIDTH
  },
  /** 获取方块缩放比例 */
  getSquareScale: (state: State): number => {
    return state.squareSize / SQUARE_SIZE
  }
}

export type Getters = typeof getters
