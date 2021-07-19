import { State } from './state'
import { GameStatus } from '@/status'

export const mutations = {
  setGameOver: (state: State, payload: boolean): void => {
    state.gameOver = payload
  },
  setGameStatus: (state: State, payload: GameStatus): void => {
    state.gameStatus = payload
  },
  receiveVideo: (state: State, payload: string): void => {
    parseVideo(state, payload)
  }
}

export type Mutations = typeof mutations

function parseVideo (state: State, payload: string) {
  console.log(payload)
}
