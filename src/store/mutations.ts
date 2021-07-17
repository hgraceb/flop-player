import { State } from './state'
import { GameStatus } from '@/status'

export const mutations = {
  setGameOver: (state: State, payload: boolean): void => {
    state.gameOver = payload
  },
  setGameStatus: (state: State, payload: GameStatus): void => {
    state.gameStatus = payload
  }
}

export type Mutations = typeof mutations
