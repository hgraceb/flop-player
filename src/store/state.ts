import { GameEvent } from '@/game'
import { ImgCellType, ImgFaceType } from '@/util/image'

export interface State {
  // 页面缩放值
  scale: number
  width: number
  height: number
  // 游戏雷数
  mines: number
  // 游戏剩余雷数
  leftMines: number
  // 玩家名称
  player: string
  // BBBV
  bbbv: number
  // 已处理的BBBV
  solvedBbbv: number
  // 笑脸状态
  faceStatus: ImgFaceType
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
  gameElapsedTime: number,
  // 游戏录像是否处于暂停状态
  gameVideoPaused: boolean
  // 精确的横坐标
  precisionX: number
  // 精确的纵坐标
  precisionY: number
  // 是否打印录像解析相关日志
  enableParserLog: boolean
}

export const state: State = {
  scale: 1,
  width: 8,
  height: 8,
  mines: 10,
  leftMines: 10,
  player: 'Anonymous',
  bbbv: 0,
  solvedBbbv: 0,
  faceStatus: 'face-normal',
  isGameOver: false,
  gameLevel: 1,
  gameEvents: [],
  gameEventIndex: 0,
  gameBoard: [],
  gameSpeed: 1.0,
  gameStartTime: 0.0,
  gameElapsedTime: 0.0,
  gameVideoPaused: true,
  precisionX: 0,
  precisionY: 0,
  enableParserLog: false
}
