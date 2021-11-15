import { Video, VideoEvent } from '@/game/video'

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
  }

  /**
   * 读取游戏选项
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
}
