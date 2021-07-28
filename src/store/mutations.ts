import { State } from './state'
import { parse } from '@/game/parser'
import { GameEvent } from '@/game'
import { store } from '@/store/index'

export const mutations = {
  /** 初始化游戏 */
  initGame: (state: State, { width, height }: { width: number, height: number }): void => {
    state.width = width
    state.height = height
    state.gameEvents = []
    state.gameBoard = Array.from(Array(width * height), () => 'Normal')
  },
  /** 添加游戏事件 */
  addEvent: (state: State, event: GameEvent): void => {
    state.gameEvents.push(event)
  },
  /** 根据游戏事件更新游戏棋盘 */
  updateGameChord: (state: State, event: GameEvent): void => {
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

    let i = 0
    let start: number

    requestAnimationFrame(function performEvent (timestamp) {
      console.log(timestamp)
      if (i >= state.gameEvents.length) {
        return
      }
      if (start === undefined) {
        start = timestamp
      }
      const elapsed = timestamp - start
      while (i < state.gameEvents.length && elapsed >= state.gameEvents[i].time) {
        store.commit('updateGameChord', state.gameEvents[i++])
      }
      window.requestAnimationFrame(performEvent)
    })
  }
}

export type Mutations = typeof mutations
