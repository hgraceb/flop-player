import { State } from './state'
import { GameStatus } from '@/status'
import { GameBoard } from '@/game'

export const mutations = {
  setGameOver: (state: State, payload: boolean): void => {
    state.gameOver = payload
  },
  setGameStatus: (state: State, payload: GameStatus): void => {
    state.gameStatus = payload
  },
  receiveVideo: (state: State, payload: string): void => {
    try {
      parseVideo(state, payload)
    } catch (e) {
      console.log(e)
    }
  }
}

export type Mutations = typeof mutations

interface Result {
  [key: string]: string

  Width: string
  Height: string
  Board: string
}

/**
 * 解析录像数据
 *
 * @param state  Vuex.state
 * @param data 录像数据
 */
function parseVideo (state: State, data: string) {
  console.log(data)
  const rawArray = data.split('\n')
  const result: Result = { Width: '', Height: '', Board: '' } // 解析结果
  // const eventReg = /^-?\d+\.\d+[ ]+(mv|sc|mt|[lrm][cr])[ |\d]+\([ ]*\d+[ ]*\d+[ ]*\)([ ]*\(l?r?m?\))?$/ // 点击和移动事件数据，中间可能没有当前所在行和列的数据
  const normalReg = /^[a-zA-Z_]+?[:][ ]*.*\S$/ // 普通键值对数据
  const boardReg = /^[*0]+$/ // 雷的分布数据
  // let count = 0 // 当前事件数
  // 逐行读取数据，同一类型的数据可以不用放到一起
  for (let i = 0; i < rawArray.length; i++) {
    const row = rawArray[i].trim() // 去除前后空格的单行数据
    // // 事件数据一般是最多的，优先进行判断
    // if (eventReg.test(row)) {
    //   const strings = row.replace(/\(l?r?m?\)|[()]/g, '').replace(/[ ]{2,}|\./g, ' ').trim().split(' ')
    //   const previous = video[count - 1] // 前一个录像事件
    //   const x = parseInt(strings[strings.length - 2]) // 倒数第二个数据是 x 坐标
    //   const y = parseInt(strings[strings.length - 1]) // 倒数第一个数据是 y 坐标
    //   const path = count > 0 ? previous.path + Math.pow((Math.pow(x - previous.x, 2) + Math.pow(y - previous.y, 2)), 0.5) : 0
    //   video[count++] = {
    //     sec: parseInt(strings[0]),
    //     hun: parseInt(strings[1].substring(0, 2)), // 最多只保留前两位数字
    //     mouse: strings[2],
    //     rows: parseInt(x / 16) + 1, // 可能有记录，可能没记录，干脆自己计算了
    //     columns: parseInt(y / 16) + 1,
    //     x: x,
    //     y: y,
    //     path: path,
    //   }
    // } else
    if (normalReg.test(row)) {
      // 然后判断是否属于普通键值对数据
      result[row.substring(0, row.indexOf(':'))] = row.substring(row.indexOf(':') + 1, row.length).trim()
    } else if (boardReg.test(row)) {
      // 最后判断是否是雷的分布数据
      result.Board += row
    }
  }
  state.width = parseInt(result.Width)
  state.height = parseInt(result.Height)
  state.gameBoard = new GameBoard(state.width, state.height, result.Board)
  console.log(result)
}
