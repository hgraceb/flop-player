import { State } from './state'
import { parse } from '@/game/parser'
import { GameEvent } from '@/game'
import { store } from '@/store/index'
import { plus, times } from 'number-precision'
import { ImgCellType, ImgFaceType } from '@/util/image'
import { SCALE_ARRAY, SPEED_ARRAY } from '@/game/constants'

/**
 * Mutations 函数定义，使用类型推断的方式，可以快速找到函数的所有 Usages
 */
export const mutations = {
  /** 设置页面缩放值 */
  setScale: (state: State, scale: number): void => {
    if (SCALE_ARRAY.indexOf(scale) !== -1) {
      state.scale = scale
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
  /** 设置游戏经过的时间（毫秒） */
  setGameElapsedTime: (state: State, time: number): void => {
    if (state.gameElapsedTime < time) {
      state.gameElapsedTime = time
      while (state.gameEventIndex < state.gameEvents.length && state.gameElapsedTime >= state.gameEvents[state.gameEventIndex].time) {
        store.commit('performNextEvent')
      }
    } else if (state.gameElapsedTime > time) {
      state.gameElapsedTime = time
      // 游戏事件索引可能等于游戏事件总数，需要防止数组越界
      state.gameEventIndex = Math.min(state.gameEventIndex, state.gameEvents.length - 1)
      // 模拟上一个游戏事件，需要与上一个游戏事件的时间进行比较，当游戏经过的时间小于等于 0 时，模拟所有剩余事件，将游戏状态全部重置
      while (state.gameEventIndex > 0 && (state.gameElapsedTime < state.gameEvents[state.gameEventIndex - 1].time || state.gameElapsedTime <= 0)) {
        store.commit('performPreviousEvent')
      }
    }
  },
  /** 叠加游戏经过的时间（毫秒） */
  addGameElapsedTime: (state: State, time: number): void => {
    state.gameElapsedTime = plus(state.gameElapsedTime, times(time, state.gameSpeed))
  },
  /** 初始化游戏 */
  initGame: (state: State, { width, height, mines }: { width: number, height: number, mines: number }): void => {
    state.width = width
    state.height = height
    state.mines = mines
    state.leftMines = mines
    state.gameEvents = []
  },
  /** 添加游戏事件 */
  addEvent: (state: State, event: GameEvent): void => {
    state.gameEvents.push(event)
  },
  /** 接收并处理录像数据 */
  receiveVideo: (state: State, payload: string): void => {
    try {
      parse(state, payload)
      store.commit('replayVideo')
    } catch (e) {
      console.log(e)
    }
  },
  /** 模拟上一个游戏事件 */
  performPreviousEvent: (state: State): void => {
    // 根据事件索引获取游戏事件，并更新事件索引
    const event = state.gameEvents[--state.gameEventIndex]
    // 根据坐标获取索引
    const index = event.x + event.y * state.width
    // 根据快照还原图片状态
    state.gameBoard[index] = event.snapshot as ImgCellType
    // 根据游戏事件还原剩余雷数
    switch (event.name) {
      case 'Flag':
        state.leftMines++
        break
      case 'RemoveFlag':
        state.leftMines--
        break
    }
    if ('precisionX' in event) {
      state.precisionX = event.precisionX
    }
    if ('precisionY' in event) {
      state.precisionY = event.precisionY
    }
  },
  /** 模拟下一个游戏事件 */
  performNextEvent: (state: State): void => {
    // 根据事件索引获取游戏事件，并更新事件索引
    const event = state.gameEvents[state.gameEventIndex++]
    // 根据坐标获取索引
    const index = event.x + event.y * state.width
    // 将当前的背景图片保存为快照
    event.snapshot = state.gameBoard[index]
    switch (event.name) {
      case 'Flag':
        state.gameBoard[index] = 'cell-flag'
        state.leftMines--
        break
      case 'QuestionMark':
        state.gameBoard[index] = 'cell-question'
        break
      case 'RemoveQuestionMark':
        state.gameBoard[index] = 'cell-normal'
        break
      case 'RemoveFlag':
        state.gameBoard[index] = 'cell-normal'
        state.leftMines++
        break
      case 'Press':
        state.gameBoard[index] = 'cell-press'
        break
      case 'Release':
        state.gameBoard[index] = 'cell-normal'
        break
      case 'Open':
        state.gameBoard[index] = ('cell-number-' + event.number) as ImgCellType
        break
    }
    if ('precisionX' in event) {
      state.precisionX = event.precisionX
    }
    if ('precisionY' in event) {
      state.precisionY = event.precisionY
    }
  },
  /** 重新播放游戏录像，TODO 进行函数节流处理 */
  replayVideo: (state: State): void => {
    // 重置变量
    state.gameBoard = Array.from(Array(state.width * state.height), () => 'cell-normal')
    state.gameElapsedTime = 0.0
    state.gameEventIndex = 0
    state.leftMines = state.mines
    state.precisionX = 0
    state.precisionY = 0
    store.commit('playVideo')
  },
  /** 播放游戏录像，TODO 进行函数节流处理 */
  playVideo: (state: State): void => {
    // 重置变量
    state.gameVideoPaused = false
    state.gameStartTime = 0.0
    // 直接使用 requestAnimationFrame 回调的时间戳，可能会有较大误差，包括回调时间戳本身的误差和小数计算产生的误差，特别是在 Vuex 开启严格模式的时候
    requestAnimationFrame(function performEvent () {
      const timestamp = Date.now()
      if (state.gameVideoPaused || state.gameEventIndex >= state.gameEvents.length) {
        return
      }
      // 更新游戏经过的时间（毫秒）,首次时间为 0 ms
      store.commit('addGameElapsedTime', state.gameStartTime <= 0 ? 0 : timestamp - state.gameStartTime)
      // 重置游戏开始时间（毫秒）
      store.commit('setGameStartTime', timestamp)
      while (state.gameEventIndex < state.gameEvents.length && state.gameElapsedTime >= state.gameEvents[state.gameEventIndex].time) {
        store.commit('performNextEvent')
      }
      window.requestAnimationFrame(performEvent)
    })
  },
  /** 切换游戏录像播放暂停状态，cancelAnimationFrame 方法没有效果，采用标识位的方式进行暂停处理，TODO 完善游戏录像暂停逻辑，进行函数节流处理 */
  pauseVideo: (state: State): void => {
    if (state.gameVideoPaused) {
      store.commit('playVideo')
    } else {
      state.gameVideoPaused = true
    }
  }
}

/** payload 参数可以为空的函数名称集合 */
const EmptyPayloadFunction = [
  'performPreviousEvent',
  'performNextEvent',
  'replayVideo',
  'playVideo',
  'pauseVideo'
] as const

/** payload 参数不能为空的函数类型集合 */
export type MutationsMustPayload = Omit<typeof mutations, typeof EmptyPayloadFunction[number]>

/** payload 参数可以为空的函数类型集合 */
export type MutationsEmptyPayload = Omit<typeof mutations, keyof MutationsMustPayload>
