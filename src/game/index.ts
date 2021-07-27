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
export type GameEvent = {
  name: 'Press' | 'Release' | 'Open' | 'Flag' | 'RemoveFlag' | 'QuestionMark' | 'RemoveQuestionMark'
  param: number // Press 和 Release 事件的参数为 questionMark；Open 事件的参数为 number
}
