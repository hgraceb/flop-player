import { State } from './state'
import { store } from '@/store/index'
import { plus, times } from 'number-precision'
import { ImgCellType, ImgFaceType } from '@/util/image'
import { SCALE_ARRAY, SPEED_ARRAY } from '@/game/constants'
import { i18n } from '@/plugins/i18n'
import { message } from 'ant-design-vue'
import { Parser } from '@/game/Parser'
import { AVFVideo } from '@/game/AVFVideo'

/**
 * Mutations 函数定义，使用类型推断的方式，可以快速找到函数的所有 Usages
 */
export const mutations = {
  /** 设置是否显示录像地图 */
  setVideoMap: (state: State, isVideoMap: boolean): void => {
    state.isVideoMap = isVideoMap
  },
  /** 设置是否显示鼠标移动轨迹图 */
  setMousePathMove: (state: State, isMousePathMove: boolean): void => {
    state.isMousePathMove = isMousePathMove
  },
  /** 设置是否显示鼠标左键散点图 */
  setMousePathLeft: (state: State, isMousePathLeft: boolean): void => {
    state.isMousePathLeft = isMousePathLeft
  },
  /** 设置是否显示鼠标右键散点图 */
  setMousePathRight: (state: State, isMousePathRight: boolean): void => {
    state.isMousePathRight = isMousePathRight
  },
  /** 设置是否显示鼠标双击散点图 */
  setMousePathDouble: (state: State, isMousePathDouble: boolean): void => {
    state.isMousePathDouble = isMousePathDouble
  },
  /** 设置是否显示开空区域 */
  setShowOpening: (state: State, isShowOpening: boolean): void => {
    state.isShowOpening = isShowOpening
  },
  /** 设置页面缩放值 */
  setScale: (state: State, scale: number): void => {
    if (SCALE_ARRAY.includes(scale)) {
      state.scale = scale
    }
  },
  /** 设置当前语言 */
  setLocale: (state: State, locale: string): void => {
    if (i18n.global.availableLocales.includes(locale)) {
      state.locale = locale
    }
  },
  /** 设置笑脸状态，TODO 完善笑脸状态设置逻辑 */
  setFaceStatus: (state: State, faceStatus: ImgFaceType): void => {
    state.faceStatus = faceStatus
  },
  /** 设置游戏开始的时间（毫秒） */
  setGameStartTime: (state: State, time: number): void => {
    state.gameStartTime = time
  },
  /** 设置游戏速度 */
  setGameSpeed: (state: State, speed: number): void => {
    // 判断速度的值是否合法，不合法则不对游戏速度进行修改
    if (SPEED_ARRAY.indexOf(speed) !== -1) {
      state.gameSpeed = speed
    }
  },
  /** 设置游戏经过的时间（毫秒），拖动控制条调用此处时要进行节流处理 */
  setGameElapsedTime: (state: State, time: number): void => {
    if (state.gameElapsedTime < time) {
      state.gameElapsedTime = time
      while (state.gameEventIndex < state.gameEvents.length && state.gameElapsedTime >= state.gameEvents[state.gameEventIndex].time) {
        store.commit('performNextEvent')
      }
    } else if (state.gameElapsedTime > time) {
      state.gameElapsedTime = time
      // 游戏事件索引可能等于游戏事件总数，需要防止数组越界，因为会对 gameEventIndex 会进行自减操作，所以此处最大值是游戏事件的长度
      state.gameEventIndex = Math.min(state.gameEventIndex, state.gameEvents.length)
      // 模拟上一个游戏事件，需要与上一个游戏事件的时间进行比较，当游戏经过的时间小于等于 0 时，模拟所有剩余事件，将游戏状态全部重置
      while (state.gameEventIndex > 0 && (state.gameElapsedTime < state.gameEvents[state.gameEventIndex - 1].time || state.gameElapsedTime <= 0)) {
        store.commit('performPreviousEvent')
      }
    }
  },
  /** 初始化游戏 */
  initGame: (state: State, parser: Parser): void => {
    state.width = parser.getWidth()
    state.height = parser.getHeight()
    state.mines = parser.getMines()
    state.playerArray = parser.getPlayerArray()
    state.bbbv = parser.getBBBV()
    state.openings = parser.getOpenings()
    state.islands = parser.getIslands()
    state.gZiNi = parser.getGZiNi()
    state.hZiNi = parser.getHZiNi()
    state.gameEvents = parser.getGameEvents()
    state.gameCellBoard = parser.getBoard()
  },
  /** 接收并处理录像数据 */
  receiveVideo: (state: State, data: ArrayBuffer): void => {
    let parser
    try {
      parser = new Parser(new AVFVideo(data))
    } catch (e) {
      // 展示录像解析失败的相关信息
      message.error(`${i18n.global.t('error.videoParse')}${e.message}`, 5)
      return
    } finally {
      // 录像解析结束后取消页面的加载状态
      state.loading = false
    }
    store.commit('initGame', parser)
    store.commit('replayVideo')
  },
  /** 设置页面加载状态 */
  setLoading: (state: State, loading: boolean): void => {
    state.loading = loading
    // 如果页面处于加载状态则暂停录像播放
    if (state.loading) store.commit('setVideoPaused')
  },
  /** 暂停录像播放 */
  setVideoPaused: (state: State): void => {
    state.videoAnimationId = 0
  },
  /** 模拟上一个游戏事件 */
  performPreviousEvent: (state: State): void => {
    // 根据事件索引获取游戏事件，并更新事件索引
    const event = state.gameEvents[--state.gameEventIndex]
    if (event.name === 'Solved3BV') {
      return
    }
    // 根据坐标获取索引
    const index = event.x + event.y * state.width
    // 根据快照还原图片状态
    state.gameImgBoard[index] = event.snapshot!.cellType
    // 根据快照还原笑脸状态
    state.faceStatus = event.snapshot!.faceStatus
    switch (event.name) {
      case 'LeftClicksAdded':
        state.gameLeftPoints.pop()
        break
      case 'RightClicksAdded':
        state.gameRightPoints.pop()
        break
      case 'DoubleClicksAdded':
        state.gameDoublePoints.pop()
        break
    }
    // 设置当前所在坐标
    if ('precisionX' in event || 'precisionY' in event) {
      // 最后一个鼠标路径坐标
      const lastPoint = state.gameMousePoints[state.gameMousePoints.length - 1]
      // 如果鼠标的坐标有变动，则移除上一个鼠标路径坐标
      if (event.precisionX !== lastPoint?.x || event.precisionY !== lastPoint?.y) {
        state.gameMousePoints.pop()
      }
    }
  },
  /** 模拟下一个游戏事件 */
  performNextEvent: (state: State): void => {
    // 根据事件索引获取游戏事件，并更新事件索引
    const event = state.gameEvents[state.gameEventIndex++]
    if (event.name === 'Solved3BV') {
      store.commit('checkVideoFinished')
      return
    }
    // 根据坐标获取索引
    const index = event.x + event.y * state.width
    // 在更新前保存快照
    event.snapshot = {
      cellType: state.gameImgBoard[index],
      faceStatus: state.faceStatus
    }
    switch (event.name) {
      case 'Flag':
        state.gameImgBoard[index] = 'cell-flag'
        break
      case 'QuestionMark':
        state.gameImgBoard[index] = 'cell-question'
        break
      case 'RemoveQuestionMark':
        state.gameImgBoard[index] = 'cell-normal'
        break
      case 'RemoveFlag':
        state.gameImgBoard[index] = 'cell-normal'
        break
      case 'Press':
        state.gameImgBoard[index] = 'cell-press'
        break
      case 'Release':
        state.gameImgBoard[index] = 'cell-normal'
        break
      case 'Open':
        // event.number === -1 不能作为游戏结束的标识，因为可能有多个雷被打开的情况
        state.gameImgBoard[index] = event.number !== -1 ? ('cell-number-' + event.number) as ImgCellType : 'cell-mine-bomb'
        break
      case 'ToggleQuestionMarkSetting':
        break
      case 'MouseMove':
        break
      case 'LeftPressWithShift':
        state.faceStatus = 'face-press-cell'
        break
      case 'LeftPress':
        state.faceStatus = 'face-press-cell'
        break
      case 'LeftClick':
        state.faceStatus = 'face-normal'
        break
      case 'RightPress':
        state.faceStatus = 'face-press-cell'
        break
      case 'RightClick':
        state.faceStatus = 'face-normal'
        break
      case 'MiddlePress':
        state.faceStatus = 'face-press-cell'
        break
      case 'MiddleClick':
        state.faceStatus = 'face-normal'
        break
      case 'LeftClicksAdded':
        // 可以先判断坐标是否重复，但是本来也没有多少个坐标点，没必要为了这几个坐标点多写十几行代码
        state.gameLeftPoints.push({ x: event.precisionX, y: event.precisionY })
        break
      case 'RightClicksAdded':
        state.gameRightPoints.push({ x: event.precisionX, y: event.precisionY })
        break
      case 'DoubleClicksAdded':
        state.gameDoublePoints.push({ x: event.precisionX, y: event.precisionY })
        break
    }
    // 设置当前所在坐标
    if ('precisionX' in event || 'precisionY' in event) {
      // 最后一个鼠标路径坐标
      const lastPoint = state.gameMousePoints[state.gameMousePoints.length - 1]
      // 如果鼠标的坐标有变动，则添加一个新的鼠标路径坐标
      if (event.precisionX !== lastPoint?.x || event.precisionY !== lastPoint?.y) {
        state.gameMousePoints.push({ x: event.precisionX, y: event.precisionY })
      }
    }
    store.commit('checkVideoFinished')
  },
  /** 重置录像参数 */
  resetVideo: (state: State): void => {
    state.gameImgBoard = Array.from(Array(state.width * state.height), () => 'cell-normal')
    state.gameElapsedTime = 0.0
    state.gameEventIndex = 0
    state.faceStatus = 'face-normal'
    state.gameMousePoints = []
    state.gameLeftPoints = []
    state.gameRightPoints = []
    state.gameDoublePoints = []
  },
  /** 重新播放游戏录像，TODO 进行函数节流处理 */
  replayVideo: (): void => {
    // 重置变量
    store.commit('resetVideo')
    // 播放录像
    store.commit('playVideo')
  },
  /** 播放游戏录像，TODO 进行函数节流处理 */
  playVideo: (state: State): void => {
    // 重置游戏开始时间
    state.gameStartTime = 0.0
    // 直接使用 requestAnimationFrame 回调的时间戳，可能会有较大误差，包括回调时间戳本身的误差和小数计算产生的误差，特别是在 Vuex 开启严格模式的时候
    const animationId = requestAnimationFrame(function performEvent () {
      const timestamp = Date.now()
      if (store.getters.isVideoPaused || state.gameEventIndex >= state.gameEvents.length || state.videoAnimationId !== animationId) {
        return
      }
      // 更新游戏经过的时间（毫秒）,首次时间为 0 ms
      const elapsedTime = state.gameStartTime <= 0 ? 0 : timestamp - state.gameStartTime
      store.commit('setGameElapsedTime', plus(state.gameElapsedTime, times(elapsedTime, state.gameSpeed)))
      // 重置游戏开始时间（毫秒）
      store.commit('setGameStartTime', timestamp)
      window.requestAnimationFrame(performEvent)
    })
    // 更新动画ID，取消其他动画
    state.videoAnimationId = animationId
  },
  /** 检查录像是否播放结束，TODO 处理录像意外结尾的情况，即没有雷被打开并且时间没有超时 */
  checkVideoFinished: (state: State): void => {
    // 如果不是最后一个游戏事件，则认为录像还未播放完成
    if (state.gameEventIndex < state.gameEvents.length) {
      return
    }
    // 设置游戏播放暂停，如果不设置的话，在游戏播放结束之后会误以为游戏还处于正常播放的状态
    store.commit('setVideoPaused')
    // 最后一个游戏事件
    const event = state.gameEvents[state.gameEvents.length - 1]
    // 游戏胜利
    if (state.bbbv === event.stats.solvedBbbv) {
      state.faceStatus = 'face-win'

      // 所有游戏事件模拟结束后，如果游戏没有胜利，则认为游戏失败
    } else {
      state.faceStatus = 'face-lose'
    }
  }
}

/** payload 参数可以为空的函数名称集合 */
const EmptyPayloadFunction = [
  'setVideoPaused',
  'performPreviousEvent',
  'performNextEvent',
  'resetVideo',
  'replayVideo',
  'playVideo',
  'pauseVideo',
  'checkVideoFinished'
] as const

/** payload 参数不能为空的函数类型集合 */
export type MutationsMustPayload = Omit<typeof mutations, typeof EmptyPayloadFunction[number]>

/** payload 参数可以为空的函数类型集合 */
export type MutationsEmptyPayload = Omit<typeof mutations, keyof MutationsMustPayload>
