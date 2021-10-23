import { State } from '@/store/state'

export const getters = {
  /** 录像是否处于暂停状态 */
  isVideoPaused: (state: State): boolean => {
    return state.videoAnimationId === 0
  }
}

export type Getters = typeof getters
