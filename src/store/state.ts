import { GameEvent } from '@/game'
import { ImgCellType, ImgFaceType } from '@/util/image'
import { storage, storageDefault } from '@/store/plugins'

export type State = typeof storageDefault & {
  width: number
  height: number
  // 游戏雷数
  mines: number
  // 玩家名称
  player: string
  // BBBV
  bbbv: number
  openings: number
  islands: number
  gZiNi: number
  hZiNi: number
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
  // 游戏开始的时间（毫秒）, 值为负数时表示还未开始
  gameStartTime: number,
  // 游戏经过的时间（毫秒）
  gameElapsedTime: number,
  // 游戏录像是否处于暂停状态
  gameVideoPaused: boolean
  // 游戏路径点坐标数组，x：精确的横坐标，y：精确的纵坐标
  gameMousePoints: { x: number, y: number }[]
  // 是否打印录像解析相关日志
  enableParserLog: boolean
}

export const state: State = {
  // 进行本地缓存的变量，不一定都能获取到默认值（比如本地只缓存了部分键值），需要手动进行设置
  scale: storage.value.scale || storageDefault.scale,
  gameSpeed: storage.value.gameSpeed || storageDefault.gameSpeed,
  // 不进行本地缓存的变量
  width: 8,
  height: 8,
  mines: 10,
  player: '',
  bbbv: 0,
  openings: 0,
  islands: 0,
  gZiNi: 0,
  hZiNi: 0,
  faceStatus: 'face-normal',
  isGameOver: false,
  gameLevel: 1,
  gameEvents: [],
  gameEventIndex: 0,
  gameBoard: [],
  gameStartTime: 0.0,
  gameElapsedTime: 0.0,
  gameVideoPaused: true,
  gameMousePoints: [],
  enableParserLog: false
}
