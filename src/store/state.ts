import { GameStatus } from '@/status'

export interface State {
  // 是否游戏结束
  gameOver: boolean,
  // 游戏状态
  gameStatus: GameStatus,
  // 游戏级别，1-初级，2-中级，3-高级，4-自定义
  gameLevel: 1 | 2 | 3 | 4,
}

export const state: State = {
  gameOver: false,
  gameStatus: GameStatus.Play,
  gameLevel: 1
}