import { ImgCellType, ImgFaceType } from '@/util/image'

/**
 * 游戏区域最小单元
 */
export class Cell {
  mine = 0
  opening = 0
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
    cellType: ImgCellType,
    // 笑脸状态
    faceStatus: ImgFaceType,
  }
} | {
  name: 'Solved3BV'
  // 已处理的BBBV
  solved: number
  // 时间
  time: number,
  // 快照
  snapshot?: {
    // 已处理的BBBV
    solvedBbbv: number
  }
}
