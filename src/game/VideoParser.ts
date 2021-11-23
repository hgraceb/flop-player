import { BaseParser, GameEvent, GameEventName } from '@/game/BaseParser'
import { BaseVideo, VideoEvent } from '@/game/BaseVideo'

interface Cell {
  // 是否为雷
  mine: boolean
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
  // 中键是否处于点击状态
  private middlePressed = false
  // Shift键是否处于点击状态
  private shiftPressed = false

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
    this.board = Array.from(Array(this.size = this.mWidth * this.mHeight), () => <Cell>{})
    for (let i = 0; i < this.size; ++i) {
      this.board[i].mine = video.getBoard()[i] === 1
    }
    // 模拟当前所有录像事件
    for (let i = 0; i < video.getEvents().length; i++) {
      this.performEvent(video.getEvents()[i])
    }
  }

  /**
   * 模拟指定录像事件
   * @param event 录像事件
   */
  private performEvent (event: VideoEvent) {
    this.curEvent = event
    switch (this.curEvent.mouse) {
      // 鼠标移动事件最多，优先进行模拟
      // 不能直接在此处添加游戏事件，因为模拟录像事件的具体实现方法内部可能会相互有引用
      case 'mv':
        this.mouseMove()
        break
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
  }

  /**
   * 添加游戏事件
   * @param name 游戏事件名称
   */
  private pushGameEvent (name: GameEventName) {
    this.mGameEvents.push({
      name: name,
      x: this.curEvent.x,
      y: this.curEvent.y,
      row: this.curEvent.row,
      column: this.curEvent.column,
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
   * 模拟鼠标移动事件
   */
  private mouseMove () {
    this.pushGameEvent('MouseMove')
  }

  /**
   * 模拟左键点击事件
   */
  private leftClick () {
    this.pushGameEvent('LeftClick')
  }

  /**
   * 模拟左键释放事件
   */
  private leftRelease () {
    this.pushGameEvent('LeftRelease')
  }

  /**
   * 模拟右键点击事件
   */
  private rightClick () {
    this.pushGameEvent('RightClick')
  }

  /**
   * 模拟右键释放事件
   */
  private rightRelease () {
    this.pushGameEvent('RightRelease')
  }

  /**
   * 模拟中键点击事件
   */
  private middleClick () {
    this.pushGameEvent('MiddleClick')
  }

  /**
   * 模拟中键释放事件
   */
  private middleRelease () {
    this.pushGameEvent('MiddleRelease')
  }

  /**
   * 模拟同时点击 shift 按钮的左键点击事件
   */
  private leftClickWithShift () {
    this.pushGameEvent('LeftClickWithShift')
  }

  /**
   * 模拟切换是否可以标记问号的录像事件
   */
  private toggleQuestionMarkSetting () {
    this.pushGameEvent('ToggleQuestionMarkSetting')
  }
}
