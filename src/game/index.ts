import { ImgCellType, ImgFaceType } from '@/util/image'

/**
 * 游戏事件
 */
export type GameEvent = ({
  // 点击和释放事件，用于切换笑脸状态和绘制路径图
  name: 'LeftClick' | 'LeftPress' | 'RightClick' | 'RightPress' | 'MiddleClick' | 'MiddlePress' | 'LeftPressWithShift'
  // 精确的横坐标
  precisionX: number
  // 精确的纵坐标
  precisionY: number
} | {
  // 点击数增加事件，用于绘制点击事件路径图
  name: 'LeftClicksAdded' | 'RightClicksAdded' | 'DoubleClicksAdded'
  // 精确的横坐标
  precisionX: number
  // 精确的纵坐标
  precisionY: number
} | {
  // 鼠标移动事件，用于绘制鼠标路径图
  name: 'MouseMove'
  // 精确的横坐标
  precisionX: number
  // 精确的纵坐标
  precisionY: number
} | {
  name: 'Flag' | 'RemoveFlag' | 'QuestionMark' | 'RemoveQuestionMark' | 'ToggleQuestionMarkSetting'
} | {
  // TODO 修改胜利和失败事件的定义，去除多余的属性
  name: 'Won' | 'Lose'
} | {
  name: 'Press' | 'Release'
  // 是否已经被标记为问号
  questioned: number
} | {
  name: 'Open'
  // 方块对应的数字，-1代表是雷，0代表是空，1~8为其他数字
  number: number
}) & {
  // 时间，单位：毫秒
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
