import { Commit } from 'vuex'
import * as api from '../api'

export const actions = {
  fetchVideo: ({ commit }: { commit: Commit }, url: string): void => {
    // 将页面加载状态设置为加载中
    commit('setLoading')
    // 暂停录像播放
    commit('setVideoPaused')
    api.fetchVideo(url, (messages: ArrayBuffer) => {
      // 接收并处理录像数据
      commit('receiveVideo', messages)
    })
  }
}

export type Actions = typeof actions
