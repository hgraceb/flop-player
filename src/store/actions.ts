import { Commit } from 'vuex'
import * as api from '../api'

export const actions = {
  fetchVideo: ({ commit }: { commit: Commit }, url: string): void => {
    api.fetchVideo(url, (messages: string) => {
      commit('receiveVideo', messages)
    })
  }
}

export type Actions = typeof actions
