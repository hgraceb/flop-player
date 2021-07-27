import { GameEvent } from '@/game'

export interface State {
  width: number
  height: number
  // 是否游戏结束
  gameOver: boolean
  // 游戏级别，1-初级，2-中级，3-高级，4-自定义
  gameLevel: 1 | 2 | 3 | 4
  // 游戏事件
  gameEvents: GameEvent[]
}

export const state: State = {
  width: 8,
  height: 8,
  gameOver: false,
  gameLevel: 1,
  gameEvents: []
}
