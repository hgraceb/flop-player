import { BaseParser, GameEvent, GameEventName } from '@/game/BaseParser'
import { BaseVideo, VideoEvent } from '@/game/BaseVideo'

class Cell {
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
  // 方块边长
  private readonly squareSize = 16
  // 游戏布局
  private board: Cell[] = []
  // 当前是否可以标记问号
  private marks: boolean
  // 上一个录像事件，使用的时候要注意各个属性值可能是 undefined
  private preEvent: VideoEvent = <VideoEvent>{}
  // 当前录像事件
  private curEvent: VideoEvent = <VideoEvent>{}
  // 游戏状态，begin = 游戏从头开始，start = 游戏开始计时（有方块被打开），win = 游戏胜利，lose = 游戏失败
  private gameState: 'Begin' | 'Start' | 'Win' | 'Lose' = 'Begin'
  // 鼠标移动距离（欧几里得距离）
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
   *
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
    this.marks = video.getMarks() === 1
    // 初始化游戏布局
    this.initBoard(video.getBoard())
    // 模拟当前所有录像事件
    for (let i = 0; i < video.getEvents().length; i++) {
      this.performEvent(video.getEvents()[i])
      // 如果游戏已经胜利或者失败，则不再模拟后续录像事件
      if (this.gameState === 'Win' || this.gameState === 'Lose') {
        // 打开未处理方块，要在事件模拟结束后调用，因为可能连续有多个方块爆炸，第一个方块爆炸后立即打开未处理方块会导致后续哑雷
        this.openUnprocessed()
        // 在所有方块处理完成后再添加游戏结束事件，避免重复添加或者在游戏结束事件之后还有其他游戏事件
        this.pushGameEvent(this.gameState)
        break
      }
    }
  }

  /**
   * 添加游戏事件
   */
  private pushGameEvent (name: GameEventName, column: number = this.curEvent.column, row: number = this.curEvent.row) {
    this.mGameEvents.push({
      name: name,
      number: this.board[column + row * this.mWidth].number,
      x: this.curEvent.x,
      y: this.curEvent.y,
      column: column,
      row: row,
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
   * 初始化游戏布局
   */
  private initBoard (board: number[]) {
    // 先初始化所有方块
    this.board = Array.from(Array(this.mWidth * this.mHeight), (_, index) => new Cell(board[index] === 1))
    // 计算每个方块对应的数字
    for (let i = 0; i < this.mWidth; i++) {
      for (let j = 0; j < this.mHeight; j++) {
        this.setNumber(i, j)
      }
    }
  }

  /**
   * 计算并设置指定方块对应的数字
   */
  private setNumber (column: number, row: number) {
    const cell = this.board[column + row * this.mWidth]
    // 如果方块超出游戏区域或者方块本身是雷则不计算周围雷的数量
    if (!this.isInside(column, row) || cell.number < 0) return
    for (let i = column - 1; i <= column + 1; i++) {
      for (let j = row - 1; j <= row + 1; j++) {
        // 如果遍历到的方块在游戏区域内并且是雷，则更新指定方块对应的数字
        cell.number += (this.isInside(i, j) && this.board[i + j * this.mWidth].number < 0) ? 1 : 0
      }
    }
  }

  /**
   * 模拟指定录像事件，对于一些特殊情况，因为很多软件的处理不一致，而且每个软件还都有很多不同的版本，模拟时基本靠个人偏好来处理，有小概率导致最后的游戏结果和统计数据有误
   * 如：Minesweeper X 1.15 和 Minesweeper Arbiter 0.52.3 支持在中键点击之后点击左键或者右键，而 Vienna Minesweeper 3.0 和 Minesweeper Clone 2007 都不支持
   * 如：Minesweeper X 1.15 在点击中键之后点击左键后接着释放左键，此时释放中不算双击，而 Minesweeper Arbiter 0.52.3 只要释放中键都算作双击
   * 如：Minesweeper X 1.15、Vienna Minesweeper 3.0 和 Minesweeper Clone 2007 在游戏时长达到 999.00 秒后可以继续进行，而 Minesweeper Arbiter 0.52.3 会按超时处理，自动判负
   * 如：Minesweeper Arbiter 0.52.3 使用的是欧几里得距离，而 FreeSweeper 10 使用的是曼哈顿距离
   * 求求你们饶了我吧...我还只是个一百多斤的孩子啊 (。﹏。*)
   *
   * @param event 录像事件
   */
  private performEvent (event: VideoEvent) {
    this.curEvent = event
    // 录像事件的坐标改变时，中间不一定会有对应的 mv 事件，坐标位置改变时则认为有鼠标移动事件发生
    this.mouseMove()
    switch (this.curEvent.mouse) {
      // 不能直接在此处添加游戏事件，因为模拟录像事件的具体实现方法内部可能会相互有引用
      // 可以在方法执行最开始处将录像事件转换为游戏事件并添加，此游戏事件的统计数据可能有问题，因为还没真的开始模拟录像事件
      // 后续根据模拟录像事件得到的多个新游戏事件，因为时间和上一个游戏事件一样，实际播放时统计数据会显示为模拟完成后的数据
      case 'lc':
        this.leftClick()
        break
      case 'lr':
        this.leftRelease()
        break
      case 'rc':
        this.rightClick()
        break
      case 'rr':
        this.rightRelease()
        break
      case 'mc':
        this.middleClick()
        break
      case 'mr':
        this.middleRelease()
        break
      case 'sc':
        this.leftClickWithShift()
        break
      case 'mt':
        this.toggleQuestionMarkSetting()
        break
    }
    this.preEvent = this.curEvent
  }

  /**
   * 模拟鼠标移动事件
   */
  private mouseMove () {
    // 如果鼠标坐标没有发生改变则不处理鼠标移动事件
    if (this.curEvent.x === this.preEvent.x && this.curEvent.y === this.preEvent.y) return
    this.pushGameEvent('MouseMove')
    // 计算的是欧几里得距离，因为通过 Minesweeper Arbiter 0.52.3 很容易就可以进行验证
    // 而 FreeSweeper 计算得到的曼哈顿距离就一言难尽了，可能打开 avf 录像计算得到的是一个值，另存为 rawvf 录像文件后重新打开又得到了一个新的值...
    this.path += Math.pow(Math.pow(this.curEvent.x - this.preEvent.x || 0, 2) + Math.pow(this.curEvent.y - this.preEvent.y || 0, 2), 0.5)
  }

  /**
   * 模拟左键点击事件
   */
  private leftClick () {
    this.pushGameEvent('LeftClick')
    this.leftPressed = true
    if (this.rightPressed) {
      this.pressAround(this.curEvent.column, this.curEvent.row)
    } else {
      this.press(this.curEvent.column, this.curEvent.row)
    }
  }

  /**
   * 模拟同时点击 shift 按钮的左键点击事件
   */
  private leftClickWithShift () {
    this.pushGameEvent('LeftClickWithShift')
    this.leftPressed = this.shiftValid = true
    this.pressAround(this.curEvent.column, this.curEvent.row)
  }

  /**
   * 模拟左键释放事件
   */
  private leftRelease () {
    this.pushGameEvent('LeftRelease')
    if (this.rightPressed || this.shiftValid) {
      this.doubleClicks++
      this.openAround(this.curEvent.column, this.curEvent.row)
    } else {
      this.leftClicks++
      this.open(this.curEvent.column, this.curEvent.row)
    }
    this.leftPressed = this.shiftValid = false
  }

  /**
   * 模拟右键点击事件
   */
  private rightClick () {
    this.pushGameEvent('RightClick')
    this.rightPressed = true
  }

  /**
   * 模拟右键释放事件
   */
  private rightRelease () {
    this.pushGameEvent('RightRelease')
    this.rightPressed = false
  }

  /**
   * 模拟中键点击事件
   */
  private middleClick () {
    this.pushGameEvent('MiddleClick')
    this.middlePressed = true
  }

  /**
   * 模拟中键释放事件
   */
  private middleRelease () {
    this.pushGameEvent('MiddleRelease')
    this.middlePressed = false
  }

  /**
   * 模拟切换是否可以标记问号的录像事件
   */
  private toggleQuestionMarkSetting () {
    this.pushGameEvent('ToggleQuestionMarkSetting')
    this.marks = !this.marks
  }

  /**
   * 判断指定方块是否在游戏区域内
   */
  private isInside (column: number, row: number) {
    return column >= 0 && column < this.mWidth && row >= 0 && row < this.mHeight
  }

  /**
   * 点击方块
   */
  private press (column: number, row: number) {
    const cell = this.board[column + row * this.mWidth]
    // 如果方块超出游戏区域、已经被打开或者已经被旗子标记，则不进行操作
    if (!this.isInside(column, row) || cell.opened || cell.flagged) return
    // 点击方块时需要先判断方块是否已经被问号标记
    this.pushGameEvent(cell.questioned ? 'PressQuestionMark' : 'Press', column, row)
  }

  /**
   * 点击本身和周围方块
   */
  private pressAround (column: number, row: number) {
    for (let i = column - 1; i <= column + 1; i++) {
      for (let j = row - 1; j <= row + 1; j++) {
        this.press(i, j)
      }
    }
  }

  /**
   * 打开方块
   */
  private open (column: number, row: number) {
    const cell = this.board[column + row * this.mWidth]
    // 如果方块超出游戏区域、已经被打开或者已经被旗子标记，则不进行操作
    if (!this.isInside(column, row) || cell.opened || cell.flagged) return
    // 来都来了，就把你给开了吧 (づ￣ 3￣)づ
    cell.opened = true
    // 如果方块不是雷，游戏事件为正常打开方块；如果方块是雷，游戏事件为方块爆炸
    this.pushGameEvent(cell.number >= 0 ? 'Open' : 'Blast', column, row)
    if (cell.number === 0) {
      // 如果当前方块属于开空，则自动打开周围方块
      this.openAround(column, row)
    } else if (cell.number < 0) {
      // 打开的方块是雷，游戏结束
      this.gameState = 'Lose'
    }
  }

  /**
   * 打开周围方块
   */
  private openAround (column: number, row: number) {
    for (let i = column - 1; i <= column + 1; i++) {
      for (let j = row - 1; j <= row + 1; j++) {
        this.open(i, j)
      }
    }
  }

  /**
   * 打开未处理方块
   */
  private openUnprocessed () {
    // TODO
  }
}
