import { createStore } from 'vuex'
import { GameStatus } from '@/status'

export interface State {
  gameStatus: GameStatus,
}

export const store = createStore<State>({
  state: {
    gameStatus: GameStatus.PLAY
  },
  mutations: {},
  actions: {},
  modules: {}
})
