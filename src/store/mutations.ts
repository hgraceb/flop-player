import { State } from './state'
import { parse } from '@/game/parser'
import { GameEvent } from '@/game'
import { store } from '@/store/index'
import { plus, times } from 'number-precision'

export const mutations = {
  /** 设置游戏开始的时间（毫秒） */
  setGameStartTime: (state: State, time: number): void => {
    state.gameStartTime = time
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
    state.gameBoard = Array.from(Array(width * height), () => 'Normal')
    state.gameStartTime = 0.0
    state.gameElapsedTime = 0.0
    state.gameEventIndex = 0
  },
  /** 添加游戏事件 */
  addEvent: (state: State, event: GameEvent): void => {
    state.gameEvents.push(event)
  },
  /** 模拟下一个游戏事件 TODO 解决参数未使用的报错 */
  performNextEvent: (state: State, _: null): void => {
    // 根据事件索引获取游戏事件，并更新事件索引
    const event = state.gameEvents[state.gameEventIndex++]
    // 根据坐标获取索引
    const index = event.x + event.y * state.width
    switch (event.name) {
      case 'Flag':
        state.gameBoard[index] = 'Flag'
        break
      case 'QuestionMark':
        state.gameBoard[index] = 'Question'
        break
      case 'RemoveQuestionMark':
      case 'RemoveFlag':
        state.gameBoard[index] = 'Normal'
        break
      case 'Press':
        state.gameBoard[index] = 'Press'
        break
      case 'Release':
        state.gameBoard[index] = 'Normal'
        break
      case 'Open':
        state.gameBoard[index] = 'Number' + event.number
        break
    }
  },
  /** 接收并处理录像数据 */
  receiveVideo: (state: State, payload: string): void => {
    try {
      parse(state, payload)
    } catch (e) {
      console.log(e)
    }

    // 直接使用 requestAnimationFrame 回调的时间戳，可能会有较大误差，包括回调时间戳本身的误差和小数计算产生的误差
    // TODO 确认是否需要优化方案减少时间误差
    requestAnimationFrame(function performEvent () {
      const timestamp = Date.now()
      if (state.gameEventIndex >= state.gameEvents.length) {
        return
      }
      // 更新游戏经过的时间（毫秒）,首次时间为 0 ms
      store.commit('addGameElapsedTime', state.gameStartTime <= 0 ? 0 : timestamp - state.gameStartTime)
      // 重置游戏开始时间（毫秒）
      store.commit('setGameStartTime', timestamp)
      while (state.gameEventIndex < state.gameEvents.length && state.gameElapsedTime >= state.gameEvents[state.gameEventIndex].time) {
        store.commit('performNextEvent', null)
      }
      window.requestAnimationFrame(performEvent)
    })
  }
}

export type Mutations = typeof mutations
