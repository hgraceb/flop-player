import { Video, VideoEvent } from '@/game/video'
import { times } from 'number-precision'

export class RawVideo extends Video {
  protected mWidth = -1
  protected mHeight = -1
  protected mMines = -1
  protected mMarks = 0
  protected mBoard: number[] = []
  protected mEvents: VideoEvent[] = []
  protected mPlayer: Uint8Array = new Uint8Array()

  constructor (data: ArrayBuffer) {
    super(data)
    this.readOptions()
    this.readBoard()
    this.readEvents()
  }

  /**
   * 读取录像选项
   */
  private readOptions () {
    // 读取基本参数
    const textDecoder = new TextDecoder()
    while (true) {
      const lineArr = this.getLine()
      if (lineArr == null) {
        this.throwError('No board')
        return
      }
      const lineStr = textDecoder.decode(lineArr).toLowerCase().trim()
      const index = lineStr.indexOf(':')
      // 如果当前行没有 ':' 字符或者 ':' 的位置在首字符，则直接读取下一行
      if (index <= 0) continue
      const option = lineStr.substring(0, index)
      const value = lineStr.substring(index + 1).trim()
      if (option === 'player') {
        this.mPlayer = lineArr.slice(index + 1)
      } else if (option === 'width') {
        this.mWidth = Number(value)
        if (!Number.isInteger(this.mWidth) || this.mWidth <= 0) this.throwError(`Invalid board width: "${value}"`)
      } else if (option === 'height') {
        this.mHeight = Number(value)
        if (!Number.isInteger(this.mHeight) || this.mHeight <= 0) this.throwError(`Invalid board height: "${value}"`)
      } else if (option === 'mines') {
        this.mMines = Number(value)
        if (!Number.isInteger(this.mMines) || this.mMines <= 0) this.throwError(`Invalid number of mines: "${value}"`)
        // QuestionMarks 是为了兼容部分旧版本录像，如：FreeSweeper release 10 保存的录像
      } else if (option === 'marks' || option === 'QuestionMarks'.toLowerCase()) {
        if (value !== 'on' && value !== 'off') this.throwError(`Invalid question marks: "${value}"`)
        this.mMarks = value === 'on' ? 1 : 0
      } else if (option === 'board') {
        break
      }
    }
    // 检查是否有必要参数
    if (this.mWidth < 0) this.throwError('No width')
    if (this.mHeight < 0) this.throwError('No height')
    if (this.mMines < 0) this.throwError('No mines')
  }

  /**
   * 读取录像布局
   */
  private readBoard () {
    // TODO 单个字符读取、调整行和列的位置、限制只能是 0 或 *，修复录像布局读取错误导致的播放问题
    for (let i = 0; i < this.mWidth; i++) {
      const line = this.getLine()
      if (line === null) {
        this.throwError('Unexpected end of board')
        return
      }
      for (let j = 0; j < this.mHeight; j++) {
        // '*'.charCodeAt(0) = 42
        this.mBoard[i * this.mWidth + j] = line[j] === 42 ? 1 : 0
      }
    }
  }

  /**
   * 读取录像事件
   */
  private readEvents () {
    // TODO 优化代码，将相似的处理提取为方法，如：修改 temp、判断数字是否正整数
    const textDecoder = new TextDecoder()
    // 判断字符是否是数字
    const isDigit = (c: string) => c >= '0' && c <= '9'
    // 循环读取录像事件
    while (true) {
      const lineArr = this.getLine()
      if (lineArr === null) break
      const lineStr = textDecoder.decode(lineArr).trim()
      // 如果首字符不是数字或者减号，则认为不是鼠标事件
      if (!isDigit(lineStr[0]) && lineStr[0] !== '-') continue
      let temp = lineStr
      const event = <VideoEvent>{}
      // 获取时间
      for (let i = 0; i < temp.length; i++) {
        if (temp[i] === ' ') {
          event.time = times(Number(temp.slice(0, i)), 1000)
          temp = temp.slice(i).trim()
          break
        }
      }
      // 获取鼠标事件
      for (let i = 0; i < temp.length; i++) {
        if (temp[i] === ' ') {
          const m = temp.slice(0, i)
          if (m === 'lc' || m === 'lr' || m === 'rc' || m === 'rr' || m === 'mc' || m === 'mr' || m === 'mv' || m === 'sc' || m === 'mt') {
            event.mouse = m
          }
          // 鼠标事件获取完成后，直接将字符串截取到 '(' 所在的位置，因为可能没有记录 column 和 row 的数据，直接跳过，后面统一通过重新计算的方式获取
          temp = temp.slice(temp.indexOf('(') + 1).trim()
          break
        }
      }
      // 获取 X 轴精确坐标
      for (let i = 0; i < temp.length; i++) {
        if (temp[i] === ' ') {
          event.x = Number(temp.slice(0, i))
          temp = temp.slice(i).trim()
          break
        }
      }
      // 获取 Y 轴精确坐标
      for (let i = 0; i < temp.length; i++) {
        if (temp[i] === ')') {
          event.y = Number(temp.slice(0, i))
          temp = temp.slice(i).trim()
          break
        }
      }
      // 判断录像事件是否成功获取，TODO 判断 X 坐标和 Y 轴坐标是否可以超出游戏范围
      if (Number.isNaN(event.time) || event.mouse === undefined || !Number.isInteger(event.x) || !Number.isInteger(event.y)) {
        this.throwError(`Invalid mouse event: "${lineStr}"`)
      }
      event.column = Math.floor(event.x / 16)
      event.row = Math.floor(event.y / 16)
      this.mEvents.push(event)
    }
  }
}
