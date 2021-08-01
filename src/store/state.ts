import { GameEvent } from '@/game'
import { ImgCellType } from '@/util/image'

export interface State {
  width: number
  height: number
  // 是否游戏结束
  isGameOver: boolean
  // 游戏级别，1-初级，2-中级，3-高级，4-自定义
  gameLevel: 1 | 2 | 3 | 4
  // 游戏事件
  gameEvents: GameEvent[],
  // 游戏事件索引
  gameEventIndex: number
  // 游戏棋盘
  gameBoard: ImgCellType[],
  // 游戏速度
  gameSpeed: number,
  // 游戏开始的时间（毫秒）, 值为负数时表示还未开始
  gameStartTime: number,
  // 游戏经过的时间（毫秒）
  gameElapsedTime: number
}

export const state: State = {
  width: 8,
  height: 8,
  isGameOver: false,
  gameLevel: 1,
  gameEvents: [],
  gameEventIndex: 0,
  gameBoard: [],
  gameSpeed: 1.0,
  gameStartTime: 0.0,
  gameElapsedTime: 0.0
}
