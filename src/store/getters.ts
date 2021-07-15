import { GetterTree } from 'vuex'
import { State } from './state'

const _getters = {
  isGameOver: (state: State) => {
    return state.gameOver
  }
}

export const getters = _getters as GetterTree<State, State> & typeof _getters
export type Getters = typeof getters
