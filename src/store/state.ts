import { Cell, GameEvent } from '@/game'
import { ImgCellType, ImgFaceType } from '@/util/image'
import { storage, storageDefault } from '@/store/plugins'

export type State = typeof storageDefault & {
  width: number
  height: number
  // 游戏雷数
  mines: number
  // 玩家名称原始数据
  playerArray: Uint8Array
  // 录像动画ID，同一时间只播放一个录像，重置为 0 后其他录像动画全部取消，录像播放处于暂停状态
  videoAnimationId: number
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
  // 游戏方块信息棋盘，存放方块固有信息
  gameCellBoard: Cell[],
  // 游戏图片信息棋盘，存放方块当前对应的图片信息
  gameImgBoard: ImgCellType[],
  // 游戏开始的时间（毫秒）, 值为负数时表示还未开始
  gameStartTime: number,
  // 游戏经过的时间（毫秒）
  gameElapsedTime: number,
  // 游戏路径点坐标数组，x：精确的横坐标，y：精确的纵坐标
  gameMousePoints: { x: number, y: number }[]
  // 游戏左键点坐标数组，x：精确的横坐标，y：精确的纵坐标
  gameLeftPoints: { x: number, y: number }[]
  // 游戏右键点坐标数组，x：精确的横坐标，y：精确的纵坐标
  gameRightPoints: { x: number, y: number }[]
  // 游戏双击点坐标数组，x：精确的横坐标，y：精确的纵坐标
  gameDoublePoints: { x: number, y: number }[]
  // 是否打印录像解析相关日志
  enableParserLog: boolean
  // 页面加载中，null 表示页面处于初始加载状态，但是没有正在加载的内容
  loading: boolean | null
}

export const state: State = {
  // 进行本地缓存的变量，不一定都能获取到默认值（比如本地只缓存了部分键值），需要手动进行设置
  scale: storage.value.scale ?? storageDefault.scale,
  locale: storage.value.locale ?? storageDefault.locale,
  gameSpeed: storage.value.gameSpeed ?? storageDefault.gameSpeed,
  isVideoMap: storage.value.isVideoMap ?? storageDefault.isVideoMap,
  isMousePathMove: storage.value.isMousePathMove ?? storageDefault.isMousePathMove,
  isMousePathLeft: storage.value.isMousePathLeft ?? storageDefault.isMousePathLeft,
  isMousePathRight: storage.value.isMousePathRight ?? storageDefault.isMousePathRight,
  isMousePathDouble: storage.value.isMousePathDouble ?? storageDefault.isMousePathDouble,
  isShowOpening: storage.value.isShowOpening ?? storageDefault.isShowOpening,
  // 不进行本地缓存的变量
  width: 8,
  height: 8,
  mines: 10,
  playerArray: new Uint8Array(),
  videoAnimationId: 0,
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
  gameCellBoard: [],
  gameImgBoard: [],
  gameStartTime: 0.0,
  gameElapsedTime: 0.0,
  gameMousePoints: [],
  gameLeftPoints: [],
  gameRightPoints: [],
  gameDoublePoints: [],
  enableParserLog: false,
  loading: null
}
