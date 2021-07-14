import { createStore } from 'vuex'
import { GameStatus } from '@/status'

export interface State {
  gameOver: boolean,
  gameStatus: GameStatus,
}

export const store = createStore<State>({
  state: {
    gameOver: false,
    gameStatus: GameStatus.PLAY
  },
  mutations: {
    gameWin (state) {
      state.gameOver = true
    },
    gameLose (state) {
      state.gameOver = true
    }
  },
  actions: {},
  modules: {},
  getters: {
    isGameOver: (state): boolean => state.gameOver
  }
})
