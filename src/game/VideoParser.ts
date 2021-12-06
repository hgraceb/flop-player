import { BaseParser, Cell, GameEvent, GameEventName } from '@/game/BaseParser'
import { BaseVideo, VideoEvent } from '@/game/BaseVideo'
import { round } from 'number-precision'

/**
 * 录像事件解析器
 * 原本想直接用 https://github.com/thefinerminer/minesweeper-rawvf 的 RAWVF2RAWVF 对录像事件进行解析，但是后面才发现问题实在是太多了
 * 如：双击次数计算错误、问号标记处理错误、不支持切换问号标记模式、鼠标移动距离计算错误、超出游戏区域的录像事件处理有问题、输出内容缺少 Board 字段......
 * 而且整个工程基本没有在维护，现在就是后悔...非常后悔 (；′⌒`)，不过其中部分代码还是很有参考价值的，只能说明人呐还是不能太懒 (ง •_•)ง
 */
export class VideoParser extends BaseParser {
  /* 基础录像数据 */
  protected readonly mWidth: number
  protected readonly mHeight: number
  protected readonly mMines: number
  protected readonly mMarks: boolean
  protected readonly mVideoBoard: number[]
  protected readonly mPlayerArray: Uint8Array

  /* 通过二次计算得到的录像数据 */
  protected readonly mBBBV: number
  protected mIslands = 0
  protected mOpenings = 0
  protected mGameBoard: Cell[] = []
  protected mGameEvents: GameEvent[] = []

  /* 计算录像数据需要用到的变量 */
  // 是否允许追加事件
  private readonly appendable: boolean
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
  // 未解决的开空数组，第 1 个元素为 0，编号为 x 的开空数量放在第 x + 1 个元素
  private unsolvedOps = [0]
  // 已解决的岛屿数量
  private solvedIsls = 0
  // 未解决的岛屿数组，第 1 个元素为 0，编号为 x 的岛屿数量放在第 x + 1 个元素
  private unsolvedIsls = [0]
  // 已解决的 BBBV 数量
  private solvedBBBV = 0
  // 左键点击数
  private leftClicks = 0
  // 右键点击数，使用 FreeSweeper Release 10 的计数方法，虽然最终结果与 Minesweeper Arbiter 0.52.3 一样，但是更方便计算并且符合直觉
  private rightClicks = 0
  // 双击点击数
  private doubleClicks = 0
  // 多余的左键点击数，没有改变游戏局面则记为一次多余的左键点击次数
  private wastedLeftClicks = 0
  // 多余的右键点击数，没有改变游戏局面则记为一次多余的右键点击次数
  private wastedRightClicks = 0
  // 多余的双击点击数，没有改变游戏局面则记为一次多余的双击点击次数
  private wastedDoubleClicks = 0
  // 左键是否处于点击状态
  private leftPressed = false
  // 右键是否处于点击状态
  private rightPressed = false
  // 中键是否处于点击状态，中键和左右键相对独立，所以不必判断中键是否处于有效状态
  private middlePressed = false
  // 左键是否处于有效状态，因为右键事件会影响左键事件，如在游戏区域内任一方块执行：lc -> rc -> rr，此时执行 lr 事件不增加左键点击数、执行 mv 事件不更改方块样式
  private leftValid = false
  // 右键是否处于有效状态，因为左键事件会影响右键事件，如在已经打开的方块上面执行：rc -> lc -> rr，最终右键点击数不变，双击点击数加一
  private rightValid = false
  // Shift键是否处于有效状态，因为部分软件支持左键和Shift键同时按下，相当于中键的效果
  private shiftValid = false

  /**
   * 构建录像事件解析器
   *
   * @param video 录像信息
   * @param appendable 是否允许追加录像事件，不允许则所有录像事件都模拟完成后还没胜利或失败则认为录像解析意外结尾
   */
  constructor (video: BaseVideo, appendable: boolean) {
    super()
    // 保存录像基本信息
    this.mWidth = video.getWidth()
    this.mHeight = video.getHeight()
    this.mMines = video.getMines()
    this.mVideoBoard = video.getBoard()
    this.mPlayerArray = video.getPlayerArray()
    // 保存其他视频信息
    this.appendable = appendable
    this.mMarks = this.marks = video.getMarks()
    // 初始化游戏布局
    this.initBoard(video.getBoard())
    // 计算最少左键点击数
    this.mBBBV = this.mOpenings + this.unsolvedIsls.reduce((pre, cur) => pre + cur)
    // 模拟当前所有录像事件
    for (let i = 0; i < video.getEvents().length; i++) {
      this.performEvent(video.getEvents()[i])
      // 如果游戏已经胜利或者失败，则不再模拟后续录像事件
      if (this.gameState === 'Win' || this.gameState === 'Lose') break
    }
    // 在所有录像事件全部模拟完成后，如果不允许追加录像事件
    if (!appendable) {
      // 如果游戏一个方块都没有打开，则抛出一个错误，因为播放的时候需要 Start 事件才开始计时，没有计时的话就永远无法到达录像结尾的真实
      if (this.gameState === 'Begin') this.error('Unexpected end of video events')
      // 如果游戏还搁这开始呢，没有胜利或者失败，则认为录像意外结尾，可能是录像文件损坏导致部分录像事件缺失，或者游戏超时自动判负（如：Minesweeper Arbiter 0.52.3）
      else if (this.gameState === 'Start') this.pushGameEvent('UnexpectedEnd')
    }
  }

  /**
   * 追加录像事件
   */
  appendEvent (event: VideoEvent): GameEvent[] {
    // 如果允许追加录像事件才进行模拟
    if (this.appendable) this.performEvent(event)
    return this.mGameEvents
  }

  /**
   * 添加游戏事件
   */
  private pushGameEvent (name: GameEventName, column: number = this.curEvent.column, row: number = this.curEvent.row): void {
    this.mGameEvents.push({
      name: name,
      time: this.curEvent.time,
      number: this.isInside(column, row) ? this.mGameBoard[column + row * this.mWidth].number : undefined,
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
        doubleClicks: this.doubleClicks,
        wastedLeftClicks: this.wastedLeftClicks,
        wastedRightClicks: this.wastedRightClicks,
        wastedDoubleClicks: this.wastedDoubleClicks
      }
    })
  }

  /**
   * 初始化游戏布局
   */
  private initBoard (board: number[]): void {
    // 先初始化所有方块
    this.mGameBoard = Array.from(Array(this.mWidth * this.mHeight), (_, index) => new Cell(board[index] === 1))
    // 计算每个方块对应的数字
    for (let i = 0; i < this.mWidth; i++) {
      for (let j = 0; j < this.mHeight; j++) {
        this.mGameBoard[i + j * this.mWidth].number = this.getAroundMines(i, j)
      }
    }
    // 设置每个方块对应的开空
    for (let i = 0; i < this.mWidth; i++) {
      for (let j = 0; j < this.mHeight; j++) {
        const cell = this.mGameBoard[i + j * this.mWidth]
        // 方块是开空，并且没有设置过属于哪个开空（可能同时属于两个不同编号的开空）
        if (cell.number === 0 && cell.opening === 0) this.setOpeningsAround(i, j, ++this.mOpenings)
      }
    }
    // 设置每个方块对应的岛屿
    for (let i = 0; i < this.mWidth; i++) {
      for (let j = 0; j < this.mHeight; j++) {
        const cell = this.mGameBoard[i + j * this.mWidth]
        // 方块不是雷、不属于开空、是岛屿并且没有设置过属于哪个岛屿
        if (cell.number > 0 && cell.opening === 0 && cell.island === 0) this.setIslandAround(i, j, ++this.mIslands)
      }
    }
  }

  /**
   * 设置方块所在开空
   */
  private setOpenings (column: number, row: number, opening: number): void {
    const cell = this.mGameBoard[column + row * this.mWidth]
    // 如果方块超出游戏区域、方块本身是雷或者方块已经设置过对应开空则则不进行设置
    if (!this.isInside(column, row) || cell.number === -1 || cell.opening === opening || cell.opening2 === opening) return
    // 注意以下的赋值逻辑都基于 cell.opening !== opening && cell.opening2 !== opening
    if (cell.number === 0) {
      cell.opening = opening
      this.setOpeningsAround(column, row, opening)
    } else if (cell.opening) {
      // 如果当前方块已经属于另外一个开空，则设置 opening2 的值
      cell.opening2 = opening
    } else {
      cell.opening = opening
    }
    // 添加未完成的开空方块数量
    this.unsolvedOps[opening] = this.unsolvedOps[opening] ? this.unsolvedOps[opening] + 1 : 1
  }

  /**
   * 设置本身和周围方块所在开空
   */
  private setOpeningsAround (column: number, row: number, opening: number): void {
    for (let i = column - 1; i <= column + 1; i++) {
      for (let j = row - 1; j <= row + 1; j++) {
        this.setOpenings(i, j, opening)
      }
    }
  }

  /**
   * 设置方块所在岛屿
   */
  private setIsland (column: number, row: number, island: number): void {
    // 如果方块超出游戏区域则不进行设置
    if (!this.isInside(column, row)) return
    const cell = this.mGameBoard[column + row * this.mWidth]
    // 方块不是雷、不属于开空并且没有设置过属于哪个岛屿
    if (cell.number > 0 && cell.opening === 0 && cell.island === 0) {
      cell.island = island
      this.setIslandAround(column, row, island)
      // 添加未完成的岛屿方块数量
      this.unsolvedIsls[island] = this.unsolvedIsls[island] ? this.unsolvedIsls[island] + 1 : 1
    }
  }

  /**
   * 设置本身和周围方块所在岛屿
   */
  private setIslandAround (column: number, row: number, island: number): void {
    for (let i = column - 1; i <= column + 1; i++) {
      for (let j = row - 1; j <= row + 1; j++) {
        this.setIsland(i, j, island)
      }
    }
  }

  /**
   * 获取指定方块周围是雷的方块数量
   */
  private getAroundMines (column: number, row: number): number {
    const cell = this.mGameBoard[column + row * this.mWidth]
    // 如果方块超出游戏区域或者方块本身是雷则不计算周围雷的数量
    if (!this.isInside(column, row) || cell.number === -1) return cell.number
    // 周围是雷的方块数量
    let mines = 0
    for (let i = column - 1; i <= column + 1; i++) {
      for (let j = row - 1; j <= row + 1; j++) {
        // 如果遍历到的方块在游戏区域内并且是雷
        mines += (this.isInside(i, j) && this.mGameBoard[i + j * this.mWidth].number === -1) ? 1 : 0
      }
    }
    return mines
  }

  /**
   * 获取指定方块周围被旗子标记的方块数量
   */
  private getAroundFlags (column: number, row: number): number {
    // 周围被旗子标记的方块数量
    let flags = 0
    // 如果方块超出游戏区域则直接返回
    if (!this.isInside(column, row)) return flags
    for (let i = column - 1; i <= column + 1; i++) {
      for (let j = row - 1; j <= row + 1; j++) {
        // 如果遍历到的方块在游戏区域内并且被旗子标记
        flags += (this.isInside(i, j) && this.mGameBoard[i + j * this.mWidth].flagged) ? 1 : 0
      }
    }
    return flags
  }

  /**
   * 模拟指定录像事件，对于一些特殊情况，因为很多软件的处理不一致，而且每个软件还都有很多不同的版本，模拟时基本靠个人偏好来处理，有小概率导致最后的游戏结果和统计数据有误
   * 如：Minesweeper X 1.15 和 Minesweeper Arbiter 0.52.3 支持在中键点击之后点击左键或者右键，而 Vienna Minesweeper 3.0 和 Minesweeper Clone 2007 都不支持
   * 如：Minesweeper X 1.15 在点击中键之后点击左键后接着释放左键，此时释放中不算双击，而 Minesweeper Arbiter 0.52.3 只要释放中键都算作双击
   * 如：Minesweeper X 1.15、Vienna Minesweeper 3.0 和 Minesweeper Clone 2007 在游戏时长达到 999.00 秒后可以继续进行，而 Minesweeper Arbiter 0.52.3 会按超时处理，自动判负
   * 如：Minesweeper Arbiter 0.52.3 使用的是欧几里得距离，而 FreeSweeper 10 使用的是曼哈顿距离
   * 如：Minesweeper X 1.15 将没有与左键同时按下的右键点击事件记做一次右键点击次数，如果此右键事件发生在已打开的方块上，Minesweeper Arbiter 0.52.3 在后续第一次出现左键释放或者右键释放事件时会额外扣除一次右键点击数
   * 求求你们饶了我吧...我还只是个一百多斤的孩子啊 (。﹏。*)
   *
   * @param event 录像事件
   */
  private performEvent (event: VideoEvent): void {
    // 游戏结束后不再模拟录像事件
    if (this.gameState === 'Win' || this.gameState === 'Lose') return
    this.curEvent = event
    // 时间流向出现了问题，后一个录像事件的时间不能小于前一个录像事件事件，0 < undefined 的结果也是 false，所以不用考虑前一个录像事件没有赋值的情况
    if (this.curEvent.time < this.preEvent.time) this.error(`Unexpected time flow: ${round(this.preEvent.time / 1000, 3).toFixed(3)} to ${round(this.curEvent.time / 1000, 3).toFixed(3)}`)
    // 录像事件的坐标改变时，中间不一定会有对应的 mv 事件，坐标位置改变时则认为有鼠标移动事件发生
    this.mouseMove()
    switch (this.curEvent.mouse) {
      // 不能直接在此处添加游戏事件，因为模拟录像事件的具体实现方法内部可能会相互有引用
      // 可以在方法执行最开始处将录像事件转换为游戏事件并添加，此游戏事件的统计数据可能有问题，因为还没真的开始模拟录像事件
      // 后续根据模拟录像事件得到的多个新游戏事件，因为时间和上一个游戏事件一样，实际播放时统计数据会显示为模拟完成后的数据
      case 'lc':
        this.leftPress()
        break
      case 'lr':
        this.leftRelease()
        break
      case 'rc':
        this.rightPress()
        break
      case 'rr':
        this.rightRelease()
        break
      case 'mc':
        this.middlePress()
        break
      case 'mr':
        this.middleRelease()
        break
      case 'sc':
        this.leftPressWithShift()
        break
      case 'mt':
        this.toggleQuestionMarkSetting()
        break
    }
    this.preEvent = this.curEvent
    // 检查游戏是否已经结束
    this.checkGameOver()
  }

  /**
   * 检查游戏是否已经结束
   */
  private checkGameOver () {
    // 如果游戏已经结束
    if (this.gameState === 'Win' || this.gameState === 'Lose') {
      // 处理未打开方块，要在事件模拟结束后调用，因为可能连续有多个方块爆炸，第一个方块爆炸后立即处理未打开方块会导致后续哑雷
      this.handleUnopened()
      // 在所有方块处理完成后再添加游戏结束事件，避免重复添加或者在游戏结束事件之后还有其他游戏事件
      this.pushGameEvent(this.gameState)
    }
  }

  /**
   * 模拟鼠标移动事件
   */
  private mouseMove (): void {
    // 如果鼠标坐标没有发生改变则不处理鼠标移动事件
    if (this.curEvent.x === this.preEvent.x && this.curEvent.y === this.preEvent.y) return
    this.pushGameEvent('MouseMove')
    // 计算的是欧几里得距离，因为通过 Minesweeper Arbiter 0.52.3 很容易就可以进行验证
    // 而 FreeSweeper 计算得到的曼哈顿距离就一言难尽了，可能打开 avf 录像计算得到的是一个值，另存为 rawvf 录像文件后重新打开又得到了一个新的值...
    // 不过要注意 Minesweeper Arbiter 0.52.3 来回拖动进度条的话可能导致 path 的计算结果不准确，所以不要随便脱呀啊喂 (σ｀д′)σ
    this.path += Math.pow(Math.pow(this.curEvent.x - this.preEvent.x || 0, 2) + Math.pow(this.curEvent.y - this.preEvent.y || 0, 2), 0.5)
    // 如果鼠标所在方块没有发生改变则不处理方块状态变化
    if (this.curEvent.column === this.preEvent.column && this.curEvent.row === this.preEvent.row) return
    // 根据按键状态改变前一个方块和当前方块及其周围方块的状态
    if ((this.leftPressed && (this.rightPressed || this.shiftValid)) || this.middlePressed) {
      this.releaseAround(this.preEvent.column, this.preEvent.row)
      this.pressAround(this.curEvent.column, this.curEvent.row)
    } else if (this.leftPressed && this.leftValid) {
      this.release(this.preEvent.column, this.preEvent.row)
      this.press(this.curEvent.column, this.curEvent.row)
    }
  }

  /**
   * 模拟左键点击事件
   */
  private leftPress (): void {
    this.pushGameEvent('LeftPress')
    // 左键按下时将左键置为有效状态
    this.leftPressed = this.leftValid = true
    if (this.rightPressed) {
      this.pressAround(this.curEvent.column, this.curEvent.row)
    } else {
      this.press(this.curEvent.column, this.curEvent.row)
    }
  }

  /**
   * 模拟同时按住Shift键的左键点击事件
   */
  private leftPressWithShift (): void {
    this.pushGameEvent('LeftPressWithShift')
    // 左键和Shift同时按下时将左键和Shift键都设为有效状态
    this.pressAround(this.curEvent.column, this.curEvent.row)
    this.leftPressed = this.leftValid = this.shiftValid = true
  }

  /**
   * 模拟左键释放事件
   */
  private leftRelease (): void {
    this.pushGameEvent('LeftRelease')
    if (this.rightPressed || this.shiftValid) {
      this.doubleClicks++
      this.pushGameEvent('DoubleIncrease')
      this.releaseAround(this.curEvent.column, this.curEvent.row)
      if (!this.openAround(this.curEvent.column, this.curEvent.row)) this.wastedDoubleClicks++
    } else if (this.leftValid) {
      // 如果左键键点击到左键释放中间没有释放右键的操作
      this.leftClicks++
      this.pushGameEvent('LeftIncrease')
      this.release(this.curEvent.column, this.curEvent.row)
      // 打开方块并判断是否打开成功
      if (!this.open(this.curEvent.column, this.curEvent.row)) this.wastedLeftClicks++
    }
    // 左键释放后，重置所有左右键相关状态位
    this.leftPressed = this.leftValid = this.rightValid = this.shiftValid = false
  }

  /**
   * 模拟右键点击事件
   */
  private rightPress (): void {
    this.pushGameEvent('RightPress')
    if (this.leftPressed) {
      this.pressAround(this.curEvent.column, this.curEvent.row)
    } else if (this.toggleLabel(this.curEvent.column, this.curEvent.row)) {
      // 如果右键单击成功改变游戏局面，则直接记为一次有效的右键点击数
      this.rightClicks++
      this.pushGameEvent('RightIncrease')
      // 右键点击数已经被计算过，释放右键的时候不再重复计算
      this.rightValid = false
    } else {
      // 如果右键单击没有改变游戏局面，只有在左键没有按下的时候释放右键才算一次右键点击数
      this.rightValid = true
    }
    this.rightPressed = true
  }

  /**
   * 模拟右键释放事件
   */
  private rightRelease (): void {
    this.pushGameEvent('RightRelease')
    if (this.leftPressed) {
      this.doubleClicks++
      this.pushGameEvent('DoubleIncrease')
      this.releaseAround(this.curEvent.column, this.curEvent.row)
      if (!this.openAround(this.curEvent.column, this.curEvent.row)) this.wastedDoubleClicks++
    } else if (this.rightValid) {
      // 如果右键点击时没有被计算为有效点击数，并且右键点击到右键释放中间没有释放左键的操作，则将左键没有按下时候的右键释放事件记为一次右键点击数
      this.rightClicks++
      this.pushGameEvent('RightIncrease')
      this.wastedRightClicks++
    }
    // 右键释放后，重置所有左右键相关状态位
    this.rightPressed = this.leftValid = this.rightValid = this.shiftValid = false
  }

  /**
   * 模拟中键点击事件
   */
  private middlePress (): void {
    this.pushGameEvent('MiddlePress')
    this.pressAround(this.curEvent.column, this.curEvent.row)
    this.middlePressed = true
  }

  /**
   * 模拟中键释放事件
   */
  private middleRelease (): void {
    this.pushGameEvent('MiddleRelease')
    this.doubleClicks++
    this.pushGameEvent('DoubleIncrease')
    this.releaseAround(this.curEvent.column, this.curEvent.row)
    // 中键和左右键互不影响，不用判断左右键的状态，开就完了 (*￣3￣)╭
    if (!this.openAround(this.curEvent.column, this.curEvent.row)) this.wastedDoubleClicks++
    this.middlePressed = false
  }

  /**
   * 模拟切换是否可以标记问号的录像事件
   */
  private toggleQuestionMarkSetting (): void {
    this.pushGameEvent('ToggleQuestionMarkSetting')
    this.marks = !this.marks
  }

  /**
   * 判断指定方块是否在游戏区域内
   */
  private isInside (column: number, row: number): boolean {
    return column >= 0 && column < this.mWidth && row >= 0 && row < this.mHeight
  }

  /**
   * 切换方块标记状态
   *
   * @return boolean 方块标记状态是否切换
   */
  private toggleLabel (column: number, row: number): boolean {
    const cell = this.mGameBoard[column + row * this.mWidth]
    // 如果在游戏区域外或者在已经被打开的方块上单击右键
    if (!this.isInside(column, row) || cell.opened) return false
    if (this.marks && cell.flagged) {
      // 如果启用了问号标记设置，移除旗子状态实际上的表现是标记问号
      cell.flagged = false
      cell.questioned = true
      this.pushGameEvent('QuestionMark', column, row)
    } else if (cell.flagged) {
      this.flags--
      // 如果没有启用问号标记设置，则统一移除旗子和问号状态
      cell.flagged = cell.questioned = false
      this.pushGameEvent('RemoveFlag', column, row)
    } else if (cell.questioned) {
      // 启用又禁用问号标记设置后，可能有的旗子还是问号标记的状态，统一移除旗子和问号状态
      cell.flagged = cell.questioned = false
      this.pushGameEvent('RemoveQuestionMark', column, row)
    } else {
      this.flags++
      // 没有任何标记状态，直接标雷
      cell.flagged = true
      cell.questioned = false
      this.pushGameEvent('Flag', column, row)
    }
    return true
  }

  /**
   * 点击方块
   */
  private press (column: number, row: number): void {
    const cell = this.mGameBoard[column + row * this.mWidth]
    // 如果方块超出游戏区域、已经被打开或者已经被旗子标记，则不进行操作
    if (!this.isInside(column, row) || cell.opened || cell.flagged) return
    // 根据方块当前问号标记状态添加游戏事件
    this.pushGameEvent(cell.questioned ? 'PressQuestionMark' : 'Press', column, row)
  }

  /**
   * 点击本身和周围方块
   */
  private pressAround (column: number, row: number): void {
    for (let i = column - 1; i <= column + 1; i++) {
      for (let j = row - 1; j <= row + 1; j++) {
        this.press(i, j)
      }
    }
  }

  /**
   * 释放方块
   */
  private release (column: number, row: number): void {
    const cell = this.mGameBoard[column + row * this.mWidth]
    // 如果方块超出游戏区域、已经被打开或者已经被旗子标记，则不进行操作
    if (!this.isInside(column, row) || cell.opened || cell.flagged) return
    // 根据方块当前问号标记状态添加游戏事件
    this.pushGameEvent(cell.questioned ? 'ReleaseQuestionMark' : 'Release', column, row)
  }

  /**
   * 释放本身和周围方块
   */
  private releaseAround (column: number, row: number): void {
    for (let i = column - 1; i <= column + 1; i++) {
      for (let j = row - 1; j <= row + 1; j++) {
        this.release(i, j)
      }
    }
  }

  /**
   * 打开方块
   *
   * @return boolean 方块是否打开成功
   */
  private open (column: number, row: number): boolean {
    const cell = this.mGameBoard[column + row * this.mWidth]
    // 如果方块超出游戏区域、已经被打开或者已经被旗子标记，则不进行操作
    if (!this.isInside(column, row) || cell.opened || cell.flagged) return false
    // 来都来了，就把你给开了吧 (づ￣ 3￣)づ
    cell.opened = true
    if (this.gameState === 'Begin') {
      // 录像开始时间不能大于 0，不然的话会处于一直未开始计时的状态
      if (this.curEvent.time > 0) this.error(`Unexpected video start time: ${round(this.curEvent.time / 1000, 3).toFixed(3)}`)
      // 首次方块被打开后开始游戏，开始游戏的事件在打开方块的事件之前
      this.gameState = 'Start'
      this.pushGameEvent('Start', column, row)
    }
    if (cell.number === -1) {
      // 打开的方块是雷，游戏失败
      this.gameState = 'Lose'
      this.pushGameEvent('Blast', column, row)
      return true
    }
    // 更新操作次数的数据，如果不属与岛屿和开空，则不计算为一次有效操作次数
    const solvedOps = Number(--this.unsolvedOps[cell.opening] === 0) + Number(--this.unsolvedOps[cell.opening2] === 0)
    this.solvedIsls += Number(--this.unsolvedIsls[cell.island] === 0)
    this.solvedOps += solvedOps
    this.solvedBBBV += Number(cell.island > 0) + solvedOps
    // 数据处理完成后添加打开方块的游戏事件
    this.pushGameEvent('Open', column, row)
    // 如果当前方块是开空则自动打开周围方块
    if (cell.number === 0) this.openAround(column, row)
    // 所有非雷方块都已经被打开，游戏胜利
    if (this.solvedBBBV === this.mBBBV) this.gameState = 'Win'
    return true
  }

  /**
   * 打开周围方块
   *
   * @return boolean 是否成功打开过至少一个方块
   */
  private openAround (column: number, row: number): boolean {
    const cell = this.mGameBoard[column + row * this.mWidth]
    // 是否成功打开过至少一个方块
    let opened = false
    // 只对游戏区域内已经打开过的方块执行操作，并且方块是开空或者方块周围雷的数量与方块周围被旗子标记的方块数量相等
    if (this.isInside(column, row) && cell.opened && (cell.number === 0 || cell.number === this.getAroundFlags(column, row))) {
      for (let i = column - 1; i <= column + 1; i++) {
        for (let j = row - 1; j <= row + 1; j++) {
          opened = this.open(i, j) || opened
        }
      }
    }
    return opened
  }

  /**
   * 处理未打开方块
   */
  private handleUnopened (): void {
    // 如果游戏没有胜利或者失败，则不进行处理
    if (this.gameState !== 'Win' && this.gameState !== 'Lose') return
    for (let i = 0; i < this.mWidth; i++) {
      for (let j = 0; j < this.mHeight; j++) {
        const cell = this.mGameBoard[i + j * this.mWidth]
        // 只处理未打开的方块
        if (cell.opened) continue
        // 如果方块是雷并且方块还没有被旗子标记，则根据游戏胜利或者失败添加标记对应方块样式的游戏事件
        if (cell.number === -1 && !cell.flagged) this.pushGameEvent(this.gameState === 'Win' ? 'Flag' : 'Mine', i, j)
        // 如果方块不是雷并且被旗子标记了，则添加标记错误的游戏事件，如果只是被问号标记的话则不进行处理
        else if (cell.number >= 0 && cell.flagged) this.pushGameEvent('Mislabeled', i, j)
      }
    }
  }
}
