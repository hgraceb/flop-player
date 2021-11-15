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
    // 获取基本参数
    const textDecoder = new TextDecoder()
    while (true) {
      const lineArr = this.getLine()
      if (lineArr == null) {
        this.throwError('No board')
        return
      }
      const lineStr = textDecoder.decode(lineArr).toLowerCase().trim()
      const index = lineStr.indexOf(':')
      const option = lineStr.substring(0, index)
      const value = lineStr.substring(index + 1).trim()
      if (option === 'board') {
        // 检查是否有必要参数，TODO 移动到下面判断
        if (this.mWidth < 0) this.throwError('No width')
        if (this.mHeight < 0) this.throwError('No height')
        if (this.mMines < 0) this.throwError('No mines')
        break
      } else if (option === 'width') {
        // TODO 判断参数合法性
        this.mWidth = Number(value)
      } else if (option === 'height') {
        this.mHeight = Number(value)
      } else if (option === 'mines') {
        this.mMines = Number(value)
      } else if (option === 'marks') {
        this.mMarks = value === 'on' ? 1 : 0
      }
    }
  }
}
