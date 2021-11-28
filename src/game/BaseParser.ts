import { ImgCellType, ImgFaceType } from '@/util/image'

// 基础游戏事件名称
type Base = 'LeftClick' | 'LeftRelease' | 'RightClick' | 'RightRelease' | 'MiddleClick' | 'MiddleRelease' | 'MouseMove' | 'LeftClickWithShift' | 'ToggleQuestionMarkSetting'
// 自定义游戏事件名称
type Custom = 'Press' | 'Release' | 'PressQuestionMark' | 'ReleaseQuestionMark' | 'Flag' | 'RemoveFlag' | 'QuestionMark' | 'RemoveQuestionMark' | 'Open' | 'Blast' | 'Mislabeled' | 'Start' | 'Win' | 'Lose'
// 其他游戏事件名称（暂时未实现）
type Other = 'Solved3BV' | 'LeftPressWithShift' | 'LeftPress' | 'RightPress' | 'MiddlePress' | 'LeftClicksAdded' | 'RightClicksAdded' | 'DoubleClicksAdded'

// 游戏事件名称
export type GameEventName = Base | Custom | Other

/**
 * 游戏事件
 */
export interface GameEvent {
  // 游戏事件名称
  name: GameEventName
  // 游戏事件时间
  time: number
  // 游戏事件所在列，从 0 开始
  column: number
  // 游戏事件所在行，从 0 开始
  row: number
  // 游戏事件所在方块对应的数字，即周围雷的数量，超出游戏区域时值为 undefined
  number: number | undefined
  // 鼠标指针精确横坐标，和 column 不一定是对应关系，如：双击打开周围方块
  x: number
  // 鼠标指针精确纵坐标，和 row 不一定是对应关系，如：双击打开周围方块
  y: number
  // 基础统计数据
  stats: {
    path: number
    flags: number
    solvedOps: number
    solvedBBBV: number
    solvedIsls: number
    leftClicks: number
    rightClicks: number
    doubleClicks: number
    wastedLeftClicks: number
    wastedRightClicks: number
    wastedDoubleClicks: number
  }
  // 快照
  snapshot?: {
    // 未根据游戏事件修改前的图片
    cellType: ImgCellType
    // 笑脸状态
    faceStatus: ImgFaceType
  }
}

/**
 * 方块信息
 */
export class Cell {
  // 周围是雷的方块数量，-1 代表方块本身是雷
  number: number
  // 是否已经被打开
  opened = false
  // 是否被旗子标记
  flagged = false
  // 是否被问号标记
  questioned = false
  // 所在岛屿编号，为 0 则不属于任何岛屿
  island = 0
  // 所在开空编号，为 0 则不属于任何开空
  opening = 0
  // 所在第二个开空编号，为 0 则不属于任何开空，一个方块可能同时属于两个开空
  opening2 = 0

  constructor (mine: boolean) {
    this.number = mine ? -1 : 0
  }
}

/**
 * 基础录像事件解析器
 */
export abstract class BaseParser {
  // 游戏列数
  protected abstract mWidth: number
  // 游戏行数
  protected abstract mHeight: number
  // 游戏雷数
  protected abstract mMines: number
  // 最少左键点击数
  protected abstract mBBBV: number
  // 岛屿数量
  protected abstract mIslands: number
  // 开空数量
  protected abstract mOpenings: number
  // 游戏方块信息
  protected abstract board: Cell[]
  // 当前游戏事件
  protected abstract mGameEvents: GameEvent[]
  // 玩家姓名原始数据
  protected abstract mPlayerArray: Uint8Array

  /**
   * 获取游戏列数
   */
  getWidth = (): number => this.mWidth

  /**
   * 获取游戏行数
   */
  getHeight = (): number => this.mHeight

  /**
   * 获取游戏雷数
   */
  getMines = (): number => this.mMines

  /**
   * 获取最少左键点击数
   */
  getBBBV = (): number => this.mBBBV

  /**
   * 获取岛屿数量
   */
  getIslands = (): number => this.mIslands

  /**
   * 获取开空数量
   */
  getOpenings = (): number => this.mOpenings

  /**
   * 获取游戏方块信息
   */
  getBoard = (): Cell[] => this.board

  /**
   * 获取当前游戏事件
   */
  getGameEvents = (): GameEvent[] => this.mGameEvents

  /**
   * 获取玩家姓名原始数据
   */
  getPlayerArray = (): Uint8Array => this.mPlayerArray
}
