import { Commit } from 'vuex'
import { message } from 'ant-design-vue'
import { i18n } from '@/plugins/i18n'
import { store } from '@/store/index'

const { t } = i18n.global

/**
 * 报错提示并取消页面加载状态
 *
 * @param msg 错误提示信息
 */
function messageError (msg: string) {
  message.error(msg)
  // 取消页面加载状态，避免卡在加载页面
  store.commit('setLoading', false)
}

/**
 * 检查是否只有一个文件正在处理
 *
 * @return 是否只有一个文件正在处理
 */
function checkUnique (): boolean {
  if (store.state.loading === true) {
    // 还有其他文件正在处理
    messageError(t('error.fileDuplicate'))
    return false
  }
  return true
}

/**
 * 检查文件数量
 *
 * @param fileList 文件列表
 * @return 文件数量是否合法
 */
function checkFileNumber (fileList: FileList | undefined | null): boolean {
  if (!fileList) {
    // 文件不存在
    messageError(t('error.fileNotPresent'))
    return false
  }
  if (fileList.length <= 0) {
    // 未选择文件，或者文件无法直接访问时也会导致文件列表为空，如：直接拖放移动设备中的录像文件
    messageError(t('error.fileNotSelect'))
    return false
  }
  if (fileList.length > 1) {
    // 文件数量过多
    messageError(t('error.fileTooMany', [fileList.length]))
    return false
  }
  return true
}

/**
 * 根据后缀名检查文件类型
 *
 * @param name 文件名称
 * @return 文件类型是否合法
 */
function checkFileType (name: string): boolean {
  // 获取文件扩展名
  const extension = name.indexOf('.') !== -1 ? name.substring(name.lastIndexOf('.') + 1) : ''
  if (extension !== 'rawvf') {
    // 不支持的文件
    messageError(t('error.fileUnsupported', [name]))
    return false
  }
  return true
}

/**
 * 检查文件大小
 *
 * @param size 文件字节大小
 * @param name 文件名称，用于错误提示文本
 * @return 文件大小是否合法
 */
function checkFileSize (size: number, name: string): boolean {
  if (size <= 0) {
    // 文件内容为空
    messageError(t('error.fileEmpty', [name]))
    return false
  }
  if (size / 1024 / 1024 > 5) {
    // 文件大小超过 5 MB
    messageError(t('error.fileTooLarge', [name]))
    return false
  }
  return true
}

export const actions = {
  /** 从 Uri 获取录像数据 */
  fetchUri: ({ commit }: { commit: Commit }, uri: string): void => {
    if (!checkUnique() || !checkFileType(uri)) return
    // 将页面加载状态设置为加载中并暂停录像播放
    commit('setLoading', true)
    // 请求录像数据
    const request = new XMLHttpRequest()
    request.onload = () => {
      if (!checkFileSize(request.response.byteLength, uri)) return
      // 接收并处理录像数据
      commit('receiveVideo', request.response)
    }
    request.open('GET', uri)
    request.responseType = 'arraybuffer'
    request.send()
  },
  /** 从文件列表获取录像数据 */
  fetchFiles: ({ commit }: { commit: Commit }, fileList: FileList | undefined | null): void => {
    if (!checkUnique() || !checkFileNumber(fileList) || !fileList) return
    const file = fileList[0]
    if (!checkFileType(file.name) || !checkFileSize(file.size, file.name)) return
    // 将页面加载状态设置为加载中并暂停录像播放
    commit('setLoading', true)
    // 读取文件内容
    const reader = new FileReader()
    reader.onload = function () {
      // 接收并处理录像数据
      commit('receiveVideo', reader.result)
    }
    reader.onerror = function () {
      // 文件读取出错
      messageError(t('error.fileReadError', [reader.error]))
    }
    reader.readAsArrayBuffer(file)
  }
}

export type Actions = typeof actions
