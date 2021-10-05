import { Commit } from 'vuex'
import * as api from '../api'

export const actions = {
  fetchVideo: ({ commit }: { commit: Commit }, url: string): void => {
    api.fetchVideo(url, (messages: string) => {
      // 暂停录像播放
      commit('setVideoPaused', true)
      // 接收并处理录像数据
      commit('receiveVideo', messages)
    })
  }
}

export type Actions = typeof actions
