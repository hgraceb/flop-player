import { Commit } from 'vuex'
import { message } from 'ant-design-vue'
import { i18n } from '@/plugins/i18n'

export const actions = {
  fetchUri: ({ commit }: { commit: Commit }, url: string): void => {
    // 将页面加载状态设置为加载中
    commit('setLoading', true)
    // 暂停录像播放
    commit('setVideoPaused')
    // TODO 完善录像数据获取逻辑，添加出错处理和预处理（如后缀名判断等）
    // 请求录像数据
    const request = new XMLHttpRequest()
    request.onload = () => {
      // 接收并处理录像数据
      commit('receiveVideo', request.response)
    }
    request.open('GET', url)
    request.responseType = 'arraybuffer'
    request.send()
  },
  fetchFiles: ({ commit }: { commit: Commit }, fileList: FileList | undefined): void => {
    const { t } = i18n.global
    if (fileList === undefined) {
      // 文件不存在
      message.error(t('error.fileNotPresent'))
      return
    }
    if (fileList.length <= 0) {
      // 未选择任何文件
      message.error(t('error.fileNotSelect'))
      return
    }
    if (fileList.length > 1) {
      // 文件数量过多
      message.error(t('error.fileTooMany', [fileList.length]))
      return
    }
    const file = fileList[0]
    // 获取文件扩展名
    const extension = file.name.indexOf('.') !== -1 ? file.name.substring(file.name.lastIndexOf('.') + 1) : ''
    if (extension !== 'rawvf') {
      // 文件类型错误
      message.error(t('error.fileTypeIncorrect', [file.name]))
      return
    }
    if (file.size <= 0) {
      // 文件内容为空
      message.error(t('error.fileEmpty', [file.name]))
      return
    }
    if (file.size / 1024 / 1024 > 5) {
      // 文件大小超过 5 MB
      message.error(t('error.fileTooLarge', [file.name]))
      return
    }
    // 将页面加载状态设置为加载中
    commit('setLoading', true)
    // 暂停录像播放
    commit('setVideoPaused')
    // 读取文件内容
    const reader = new FileReader()
    reader.onload = function () {
      // 接收并处理录像数据
      commit('receiveVideo', reader.result)
    }
    reader.onerror = function () {
      // 取消页面加载状态
      commit('setLoading', false)
      // 文件读取出错
      message.error(t('error.fileReadError', [reader.error]))
    }
    reader.readAsArrayBuffer(file)
  }
}

export type Actions = typeof actions
