import { Commit } from 'vuex'
import { message } from 'ant-design-vue'
import { i18n } from '@/plugins/i18n'
import { store } from '@/store/index'
import { BaseParser } from '@/game/BaseParser'
import { VideoParser } from '@/game/VideoParser'
import { AVFVideo } from '@/game/AVFVideo'
import { MVFVideo } from '@/game/MVFVideo'
import { RMVVideo } from '@/game/RMVVideo'
import { RawVideo } from '@/game/RawVideo'

const { t } = i18n.global

/** 录像扩展名 */
const FileExtension = ['avf', 'mvf', 'rmv', 'rawvf'] as const
export type FileType = typeof FileExtension[number]
export const isValidFileType = (value: FileType): boolean => FileExtension.includes(value)

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
 * 获取文件扩展名
 *
 * @param name 文件名称
 */
function getExtension (name: string) {
  return name.indexOf('.') !== -1 ? name.substring(name.lastIndexOf('.') + 1) : ''
}

/**
 * 检查文件数量
 *
 * @param fileList 文件列表
 * @param callback 错误回调
 * @return 文件数量是否合法
 */
function checkFileNumber (fileList: FileList | undefined | null, callback: (info: string) => void): boolean {
  if (!fileList) {
    // 文件不存在
    callback(t('error.fileNotPresent'))
    return false
  }
  if (fileList.length <= 0) {
    // 未选择文件，或者文件无法直接访问时也会导致文件列表为空，如：直接拖放移动设备中的录像文件
    callback(t('error.fileNotSelect'))
    return false
  }
  if (fileList.length > 1) {
    // 文件数量过多
    callback(t('error.fileTooMany', [fileList.length]))
    return false
  }
  return true
}

/**
 * 根据后缀名检查文件类型
 *
 * @param name 文件名称
 * @param callback 错误回调
 * @return 文件类型是否合法
 */
function checkFileType (name: string, callback: (info: string) => void): boolean {
  // 获取文件扩展名
  const extension = getExtension(name)
  if (isValidFileType(extension as FileType)) {
    return true
  }
  // 不支持的文件
  callback(t('error.fileUnsupported'))
  return false
}

/**
 * 检查文件大小
 *
 * @param size 文件字节大小
 * @param name 文件名称，用于错误提示文本
 * @param callback 错误回调
 * @return 文件大小是否合法
 */
function checkFileSize (size: number, name: string, callback: (info: string) => void): boolean {
  if (size <= 0) {
    // 文件内容为空
    callback(t('error.fileEmpty', [name]))
    return false
  }
  if (size / 1024 / 1024 > 5) {
    // 文件大小超过 5 MB
    callback(t('error.fileTooLarge', [name]))
    return false
  }
  return true
}

/**
 * 解析录像数据
 *
 * @param type 录像类型
 * @param data 录像原始数据
 * @param onSuccess 解析成功的回调
 * @param onError 解析失败的回调
 */
function parseVideo (type: FileType, data: ArrayBuffer, onSuccess: (video: BaseParser) => void, onError: (info: string) => void) {
  try {
    switch (type) {
      case 'avf':
        onSuccess(new VideoParser(new AVFVideo(data), false))
        break
      case 'mvf':
        onSuccess(new VideoParser(new MVFVideo(data), false))
        break
      case 'rmv':
        onSuccess(new VideoParser(new RMVVideo(data), false))
        break
      case 'rawvf':
        onSuccess(new VideoParser(new RawVideo(data), false))
        break
      default:
        onError(`${t('error.videoParse')}${t('error.fileUnsupported')}`)
    }
  } catch (e) {
    console.error(e)
    // 展示录像解析失败的相关信息
    onError(`${t('error.videoParse')}${e.message}`)
  }
}

export const actions = {
  /** 从 Uri 获取录像数据 */
  fetchUri: ({ commit }: { commit: Commit }, uri: string): void => {
    // 将页面加载状态设置为加载中并暂停录像播放
    commit('setLoading', true)
    store.dispatch('parseUri', {
      uri: uri,
      onSuccess: (video) => commit('receiveVideo', video),
      onError: (error) => messageError(error)
    })
  },
  /** 从 Uri 获取并解析录像数据 */
  parseUri: ({ commit }: { commit: Commit }, { uri, onSuccess, onError }: { uri: string, onSuccess: (video: BaseParser) => void, onError: (info: string) => void }): void => {
    if (!checkFileType(uri, onError)) return
    // 请求录像数据
    const request = new XMLHttpRequest()
    request.onload = () => {
      if (!checkFileSize(request.response.byteLength, uri, onError)) return
      // 解析录像数据
      parseVideo(getExtension(uri) as FileType, request.response, onSuccess, onError)
    }
    request.onerror = (e) => {
      console.error(e)
      // 数据请求出错，如：跨域请求
      onError(t('error.uriRequest', [uri]))
    }
    request.open('GET', uri)
    request.responseType = 'arraybuffer'
    request.send()
  },
  /** 从文件列表获取录像数据 */
  fetchFiles: ({ commit }: { commit: Commit }, fileList: FileList | undefined | null): void => {
    // 将页面加载状态设置为加载中并暂停录像播放
    commit('setLoading', true)
    store.dispatch('parseFiles', {
      fileList: fileList,
      onSuccess: (video) => commit('receiveVideo', video),
      onError: (error) => messageError(error)
    })
  },
  /** 从文件列表获取并解析录像数据 */
  parseFiles: ({ commit }: { commit: Commit }, { fileList, onSuccess, onError }: { fileList: FileList | undefined | null, onSuccess: (video: BaseParser) => void, onError: (info: string) => void }): void => {
    if (!checkFileNumber(fileList, onError) || !fileList) return
    const file = fileList[0]
    if (!checkFileType(file.name, onError) || !checkFileSize(file.size, file.name, onError)) return
    // 读取文件内容
    const reader = new FileReader()
    reader.onload = function () {
      // 解析录像数据
      parseVideo(getExtension(file.name) as FileType, reader.result as ArrayBuffer, onSuccess, onError)
    }
    reader.onerror = function (e) {
      console.error(e)
      // 文件读取出错，如：读取文件夹
      onError(t('error.fileReadError', [reader.error]))
    }
    reader.readAsArrayBuffer(file)
  }
}

export type Actions = typeof actions
