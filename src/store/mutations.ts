import { State } from './state'
import { parse } from '@/game/parser'
import { GameEvent } from '@/game'

export const mutations = {
  addEvent: (state: State, event: GameEvent): void => {
    state.gameEvents.push(event)
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
