import { State } from './state'
import { parse } from '@/game/parser'

export const mutations = {
  receiveVideo: (state: State, payload: string): void => {
    try {
      parse(state, payload)
    } catch (e) {
      console.log(e)
    }
  }
}

export type Mutations = typeof mutations
