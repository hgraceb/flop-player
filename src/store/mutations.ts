import { State } from './state'
import { GameStatus } from '@/status'
import { parse } from '@/game/parser'

export const mutations = {
  setGameOver: (state: State, payload: boolean): void => {
    state.gameOver = payload
  },
  setGameStatus: (state: State, payload: GameStatus): void => {
    state.gameStatus = payload
  },
  receiveVideo: (state: State, payload: string): void => {
    try {
      parse(state, payload)
    } catch (e) {
      console.log(e)
    }
  }
}

export type Mutations = typeof mutations
