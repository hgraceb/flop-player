import { ImgCellType } from '@/util/image'

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
  name: 'Flag' | 'RemoveFlag' | 'QuestionMark' | 'RemoveQuestionMark'
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
  // 未根据游戏事件修改前的图片
  snapshot?: ImgCellType
}
