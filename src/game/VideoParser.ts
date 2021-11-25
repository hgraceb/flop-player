import { BaseParser, GameEvent, GameEventName } from '@/game/BaseParser'
import { BaseVideo, VideoEvent } from '@/game/BaseVideo'

class Cell {
  // 是否为雷
  mine = false
  // 是雷的邻居数量
  number: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 = 0
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
}

/**
 * 录像事件解析器
 */
export class VideoParser extends BaseParser {
  /* 基础录像数据 */
  protected readonly mWidth: number
  protected readonly mHeight: number
  protected readonly mMines: number
  protected readonly mPlayerArray: Uint8Array

  /* 通过二次计算得到的录像数据 */
  protected mBBBV = 0
  protected mIslands = 0
  protected mOpenings = 0
  protected mGZiNi = 0
  protected mHZiNi = 0
  protected mGameEvents: GameEvent[] = []

  /* 计算录像数据需要用到的变量 */
  // 是否允许追加事件
  private readonly appendable: boolean
  // 游戏方块总数
  private readonly size: number
  // 游戏布雷
  private readonly board: Cell[]
  // 方块边长
  private readonly squareSize = 16
  // 当前是否可以标记问号，TODO 将类型改为 boolean
  private marks: number
  // 当前录像事件
  private curEvent: VideoEvent = <VideoEvent>{}
  // 鼠标路径距离
  private path = 0
  // 标雷数量
  private flags = 0
  // 已解决的开空数量
  private solvedOps = 0
  // 已解决的岛屿数量
  private solvedIsls = 0
  // 已解决的 BBBV 数量
  private solvedBBBV = 0
  // 左键点击数
  private leftClicks = 0
  // 右键点击数
  private rightClicks = 0
  // 双击点击数
  private doubleClicks = 0
  // 左键是否处于点击状态
  private leftPressed = false
  // 右键是否处于点击状态
  private rightPressed = false
  // 中键是否处于点击状态，左键和右键不会影响到中键，所以不必判断中键是否处于有效状态
  private middlePressed = false
  // 左键是否处于有效状态，因为右键事件会影响左键事件，如：lc -> rc -> rr，此时执行 lr 事件不增加左键点击数、执行 mv 事件不更改方块样式
  private leftValid = true
  // 右键是否处于有效状态，因为左键事件会影响右键事件，如：lc -> rc -> lr，此时执行 rr 事件不增加右键点击数
  private rightValid = true
  // Shift键是否处于有效状态，因为部分软件支持左键和Shift键同时按下，相当于中键的效果
  private shiftValid = false

  /**
   * 构建录像事件解析器
   * @param video 录像信息
   * @param appendable 是否允许追加事件，不允许则所有游戏事件都模拟完成后还没胜利自动判负
   */
  constructor (video: BaseVideo, appendable: boolean) {
    super()
    // 保存录像基本信息
    this.mWidth = video.getWidth()
    this.mHeight = video.getHeight()
    this.mMines = video.getMines()
    this.mPlayerArray = video.getPlayer()
    // 保存其他视频信息
    this.appendable = appendable
    this.marks = video.getMarks()
    this.board = Array.from(Array(this.size = this.mWidth * this.mHeight), () => new Cell())
    for (let i = 0; i < this.size; ++i) {
      this.board[i].mine = video.getBoard()[i] === 1
    }
    // 模拟当前所有录像事件
    for (let i = 0; i < video.getEvents().length; i++) {
      this.performEvent(video.getEvents()[i])
    }
  }

  /**
   * 添加游戏事件
   */
  private pushGameEvent (name: GameEventName, x: number, y: number, row: number, column: number) {
    this.mGameEvents.push({
      name: name,
      x: x,
      y: y,
      row: row,
      column: column,
      stats: {
        path: this.path,
        flags: this.flags,
        solvedOps: this.solvedOps,
        solvedIsls: this.solvedIsls,
        solvedBBBV: this.solvedBBBV,
        leftClicks: this.leftClicks,
        rightClicks: this.rightClicks,
        doubleClicks: this.doubleClicks
      }
    })
  }

  /**
   * 模拟指定录像事件，对于一些特殊情况，因为很多软件的处理不一致，而且每个软件还都有很多不同的版本，模拟时基本靠个人偏好来处理，有小概率导致最后的游戏结果和统计数据有误
   * 如：Minesweeper X 1.15 和 Minesweeper Arbiter 0.52.3 支持在中键点击之后点击左键或者右键，而 Vienna Minesweeper 3.0 和 Minesweeper Clone 2007 都不支持
   * 如：Minesweeper X 1.15 在点击中键之后点击左键后接着释放左键，此时释放中不算双击，而 Minesweeper Arbiter 0.52.3 只要释放中键都算作双击
   * 如：Minesweeper X 1.15 和 Vienna Minesweeper 3.0 在游戏时长达到 999.00 秒后可以继续进行，而 Minesweeper Arbiter 0.52.3 会按超时处理，自动判负
   * 求求你们饶了我吧...我还只是个一百多斤的孩子啊 (。﹏。*)
   * @param event 录像事件
   */
  private performEvent (event: VideoEvent) {
    this.curEvent = event
    switch (this.curEvent.mouse) {
      // 不能直接在此处添加游戏事件，因为模拟录像事件的具体实现方法内部可能会相互有引用
      // 可以在方法执行最开始处将录像事件转换为游戏事件并添加，此游戏事件的统计数据可能有问题，因为还没真的开始模拟录像事件
      // 后续根据模拟录像事件得到的多个新游戏事件，因为时间和上一个游戏事件一样，实际播放时统计数据会显示为模拟完成后的数据
      case 'mv':
        // 鼠标移动事件最多，优先进行模拟
        this.mouseMove(event.x, event.y, event.row, event.column)
        break
      case 'lc':
        this.leftClick(event.x, event.y, event.row, event.column)
        break
      case 'lr':
        this.leftRelease(event.x, event.y, event.row, event.column)
        break
      case 'rc':
        this.rightClick(event.x, event.y, event.row, event.column)
        break
      case 'rr':
        this.rightRelease(event.x, event.y, event.row, event.column)
        break
      case 'mc':
        this.middleClick(event.x, event.y, event.row, event.column)
        break
      case 'mr':
        this.middleRelease(event.x, event.y, event.row, event.column)
        break
      case 'sc':
        this.leftClickWithShift(event.x, event.y, event.row, event.column)
        break
      case 'mt':
        this.toggleQuestionMarkSetting(event.x, event.y, event.row, event.column)
        break
    }
  }

  /**
   * 模拟鼠标移动事件
   */
  private mouseMove (x: number, y: number, row: number, column: number) {
    this.pushGameEvent('MouseMove', x, y, row, column)
  }

  /**
   * 模拟左键点击事件
   */
  private leftClick (x: number, y: number, row: number, column: number) {
    this.pushGameEvent('LeftClick', x, y, row, column)
    this.leftPressed = true
    if (this.rightPressed) {
      // TODO 处理双击事件
    } else {
      this.press(row, column, x, y)
    }
  }

  /**
   * 模拟同时点击 shift 按钮的左键点击事件
   */
  private leftClickWithShift (x: number, y: number, row: number, column: number) {
    this.pushGameEvent('LeftClickWithShift', x, y, row, column)
    this.leftPressed = true
  }

  /**
   * 模拟左键释放事件
   */
  private leftRelease (x: number, y: number, row: number, column: number) {
    this.pushGameEvent('LeftRelease', x, y, row, column)
    this.leftPressed = false
  }

  /**
   * 模拟右键点击事件
   */
  private rightClick (x: number, y: number, row: number, column: number) {
    this.pushGameEvent('RightClick', x, y, row, column)
    this.rightPressed = true
  }

  /**
   * 模拟右键释放事件
   */
  private rightRelease (x: number, y: number, row: number, column: number) {
    this.pushGameEvent('RightRelease', x, y, row, column)
    this.rightPressed = false
  }

  /**
   * 模拟中键点击事件
   */
  private middleClick (x: number, y: number, row: number, column: number) {
    this.pushGameEvent('MiddleClick', x, y, row, column)
    this.middlePressed = true
  }

  /**
   * 模拟中键释放事件
   */
  private middleRelease (x: number, y: number, row: number, column: number) {
    this.pushGameEvent('MiddleRelease', x, y, row, column)
    this.middlePressed = false
  }

  /**
   * 模拟切换是否可以标记问号的录像事件
   */
  private toggleQuestionMarkSetting (x: number, y: number, row: number, column: number) {
    this.pushGameEvent('ToggleQuestionMarkSetting', x, y, row, column)
  }

  /**
   * 点击方块
   */
  private press (x: number, y: number, row: number, column: number) {
    // 如果方块已经打开或者被旗子标记，则不进行操作
    if (this.board[column * this.mWidth + row].opened || this.board[column * this.mWidth + row].flagged) return
    this.pushGameEvent('Press', x, y, row, column)
  }
}
