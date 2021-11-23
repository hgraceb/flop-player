import { ImgCellType, ImgFaceType } from '@/util/image'

// 基础事件
type Base = 'leftClick' | 'leftRelease' | 'rightClick' | 'rightRelease' | 'middleClick' | 'middleRelease' | 'mouseMove' | 'leftClickWithShift' | 'toggleQuestionMarkSetting'

/**
 * 游戏事件
 */
export interface GameEvent {
  name: Base
  // 当前列，从 0 开始
  row: number
  // 当前行，从 0 开始
  column: number
  // 精确的横坐标
  precisionX: number
  // 精确的纵坐标
  precisionY: number
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
 * 基础录像事件解析器
 */
export abstract class BaseParser {
  // 游戏列数
  protected abstract mWidth: number
  // 游戏行数
  protected abstract mHeight: number
  // 游戏雷数
  protected abstract mMines: number
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
   * 获取当前游戏事件
   */
  getGameEvents = () => this.mGameEvents

  /**
   * 获取玩家姓名原始数据
   */
  getPlayerArray = () => this.mPlayerArray
}
