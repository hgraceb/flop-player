import { ImgCellType, ImgFaceType } from '@/util/image'

/**
 * 游戏区域最小单元
 */
export class Cell {
  mine = 0
  // 当前所在的 Opening 编号，0 表示不属于任何 Opening
  opening = 0
  // 当前所在的另外一个 Opening 的编号，两个 Opening 可能有重叠的部分，0 表示不属于任何 Opening
  opening2 = 0
  island = 0
  number = 0
  rb = 0
  re = 0
  cb = 0
  ce = 0
  opened = 0
  flagged = 0
  wastedFlag = 0
  questioned = 0
  premium = 0
}

/**
 * 游戏事件
 */
export type GameEvent = ({
  name: 'LeftClick' | 'LeftPress' | 'RightClick' | 'RightPress' | 'MouseMove' | 'MiddleClick' | 'MiddlePress' | 'LeftPressWithShift'
  // 精确的横坐标
  precisionX: number
  // 精确的纵坐标
  precisionY: number
} | {
  // 点击数增加事件，用于绘制路径图
  name: 'LeftClicksAdded' | 'RightClicksAdded' | 'DoubleClicksAdded'
  // 精确的横坐标
  precisionX: number
  // 精确的纵坐标
  precisionY: number
} | {
  name: 'Flag' | 'RemoveFlag' | 'QuestionMark' | 'RemoveQuestionMark' | 'ToggleQuestionMarkSetting'
} | {
  name: 'Press' | 'Release'
  // 是否已经被标记为问号
  questioned: number
} | {
  name: 'Open'
  // 方块对应的数字，-1代表是雷，0代表是空，1~8为其他数字
  number: number
}) & {
  // 时间
  time: number
  // 第几列
  x: number
  // 第几行
  y: number
  // 快照
  snapshot?: {
    // 未根据游戏事件修改前的图片
    cellType: ImgCellType
    // 笑脸状态
    faceStatus: ImgFaceType
  }
  // 基础统计数据
  stats: {
    solvedBbbv: number
    solvedOps: number
    solvedIsls: number
    leftClicks: number
    rightClicks: number
    doubleClicks: number
    wastedLeftClicks: number
    wastedRightClicks: number
    wastedDoubleClicks: number
    path: number
    flags: number
  }
} | {
  name: 'Solved3BV'
  // 已处理的BBBV
  solved: number
  // 时间
  time: number
  // 基础统计数据
  stats: {
    solvedBbbv: number
    solvedOps: number
    solvedIsls: number
    leftClicks: number
    rightClicks: number
    doubleClicks: number
    wastedLeftClicks: number
    wastedRightClicks: number
    wastedDoubleClicks: number
    path: number
    flags: number
  }
}

/**
 * 游戏信息
 */
export type GameInfo = {
  // 游戏事件
  gameEvents: GameEvent[]
  // 列数
  width: number
  // 行数
  height: number
  // 雷数
  mines: number
  // 玩家名称原始数据
  playerArray: Uint8Array
  // 最少左键点击数
  bbbv: number
  // 开空数量
  openings: number
  // 岛屿数量
  islands: number
  // Greedy ZiNi
  gZiNi: number
  // Human ZiNi
  hZiNi: number
  // 方块棋盘信息
  board: Cell[]
}
