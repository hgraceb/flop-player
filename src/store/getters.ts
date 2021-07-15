import { GetterTree } from 'vuex'
import { State } from './state'

export const getters = {
  isGameOver: (state: State) => {
    return state.gameOver
  }
}

export type Getters = GetterTree<State, State> & typeof getters
