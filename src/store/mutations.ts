import { State } from './state'
import { parse } from '@/game/parser'
import { GameEvent } from '@/game'
import { store } from '@/store/index'
import { plus, times } from 'number-precision'
import { ImgCellType } from '@/util/image'
import { speedArr } from '@/game/contants'

/**
 * Mutations 函数定义，使用类型推断的方式，可以快速找到函数的所有 Usages
 */
export const mutations = {
  /** 设置游戏开始的时间（毫秒） */
  setGameStartTime: (state: State, time: number): void => {
    state.gameStartTime = time
  },
  /** 设置游戏速度 */
  setGameSpeed: (state: State, speed: number): void => {
    state.gameSpeed = Math.min(Math.max(speedArr[0], speed), speedArr[speedArr.length - 1])
  },
  /** 叠加游戏经过的时间（毫秒） */
  addGameElapsedTime: (state: State, time: number): void => {
    state.gameElapsedTime = plus(state.gameElapsedTime, times(time, state.gameSpeed))
  },
  /** 初始化游戏 */
  initGame: (state: State, { width, height }: { width: number, height: number }): void => {
    state.width = width
    state.height = height
    state.gameEvents = []
    state.gameBoard = Array.from(Array(width * height), () => 'cell-normal')
    state.gameStartTime = 0.0
    state.gameElapsedTime = 0.0
    state.gameEventIndex = 0
  },
  /** 添加游戏事件 */
  addEvent: (state: State, event: GameEvent): void => {
    state.gameEvents.push(event)
  },
  /** 接收并处理录像数据 */
  receiveVideo: (state: State, payload: string): void => {
    try {
      parse(state, payload)
      store.commit('playVideo')
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
    // 还原图片快照
    state.gameBoard[index] = event.snapshot as ImgCellType
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
        break
      case 'QuestionMark':
        state.gameBoard[index] = 'cell-question'
        break
      case 'RemoveQuestionMark':
      case 'RemoveFlag':
        state.gameBoard[index] = 'cell-normal'
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
  },
  /** 播放游戏录像 */
  playVideo: (state: State): void => {
    // 直接使用 requestAnimationFrame 回调的时间戳，可能会有较大误差，包括回调时间戳本身的误差和小数计算产生的误差，特别是在 Vuex 开启严格模式的时候
    requestAnimationFrame(function performEvent () {
      const timestamp = Date.now()
      if (state.gameEventIndex >= state.gameEvents.length) {
        requestAnimationFrame(function performPreviousEvent () {
          if (state.gameEventIndex <= 0) {
            return
          }
          store.commit('performPreviousEvent')
          window.requestAnimationFrame(performPreviousEvent)
        })
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
  }
}

/** payload 参数不能为空的函数类型集合 */
export type MutationsMustPayload = Omit<typeof mutations, 'performPreviousEvent' | 'performNextEvent' | 'playVideo'>

/** payload 参数可以为空的函数类型集合 */
export type MutationsEmptyPayload = Omit<typeof mutations, keyof MutationsMustPayload>
