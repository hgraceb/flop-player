import { ImgCellType, ImgFaceType } from '@/util/image'

// 基础游戏事件名称
type Base = 'LeftClick' | 'LeftRelease' | 'RightClick' | 'RightRelease' | 'MiddleClick' | 'MiddleRelease' | 'MouseMove' | 'LeftClickWithShift' | 'ToggleQuestionMarkSetting'
// 自定义游戏事件名称
type Custom = 'Press' | 'PressQuestionMark' | 'Mislabeled' | 'Open' | 'Blast' | 'Win' | 'Lose'

// 游戏事件名称
export type GameEventName = Base | Custom

/**
 * 游戏事件
 */
export interface GameEvent {
  name: GameEventName
  // 游戏事件所在列，从 0 开始
  row: number
  // 游戏事件所在行，从 0 开始
  column: number
  // 游戏事件所在方块对应的数字，即周围雷的数量
  number: number
  // 鼠标指针精确横坐标，和 row 不一定是对应关系
  x: number
  // 鼠标指针精确纵坐标，和 column 不一定是对应关系
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
  // Greedy ZiNi
  protected abstract mGZiNi: number
  // Human ZiNi
  protected abstract mHZiNi: number
  // 当前游戏事件
  protected abstract mGameEvents: GameEvent[]
  // 玩家姓名原始数据
  protected abstract mPlayerArray: Uint8Array

  /**
   * 获取游戏列数
   */
  getWidth = () => this.mWidth

  /**
   * 获取游戏行数
   */
  getHeight = () => this.mHeight

  /**
   * 获取游戏雷数
   */
  getMines = () => this.mMines

  /**
   * 获取最少左键点击数
   */
  getBBBV = () => this.mBBBV

  /**
   * 获取岛屿数量
   */
  getIslands = () => this.mIslands

  /**
   * 获取开空数量
   */
  getOpenings = () => this.mOpenings

  /**
   * 获取 Greedy ZiNi
   */
  getGZiNi = () => this.mGZiNi

  /**
   * 获取 Human ZiNi
   */
  getHZiNi = () => this.mHZiNi

  /**
   * 获取当前游戏事件
   */
  getGameEvents = () => this.mGameEvents

  /**
   * 获取玩家姓名原始数据
   */
  getPlayerArray = () => this.mPlayerArray
}
