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
  questioned: number // 是否已经被标记为问号
} | {
  name: 'Open'
  number: number // 方块对应的数字，-1代表是雷，0代表是空，1~8为其他数字
}) & {
  time: number // 时间
  x: number // 第几列
  y: number // 第几行
}
