/**
 * 录像事件信息
 */
export class VideoEvent {
  x = 0
  y = 0
  mouse = 0
}

/**
 * 录像基础信息
 */
export interface VideoInfo {
  width: number
  height: number
  mines: number
  board: string[]
  events: VideoEvent[]
  player: Uint8Array
}

/**
 * 录像信息基础类
 */
export abstract class Video {
  private mOffset = 0
  private mInfo = <VideoInfo>{}
  private readonly mData = new Uint8Array()

  protected constructor (data: ArrayBuffer) {
    this.mData = new Uint8Array(data)
  }

  /** 设置游戏基础信息 */
  protected setInfo (info: VideoInfo) {
    this.mInfo = info
  }

  /** 抛出一个错误 */
  protected throwError (msg: string): number {
    throw new Error(`${this.constructor.name}Error: ${msg}`)
  }

  /**
   * 获取下一个字节，并将位置标识符向后移动
   * @throws {Error} 数据意外结尾
   */
  protected getNum (): number {
    const num = this.mData[this.mOffset++]
    // 数据意外结尾
    if (num === undefined) {
      this.throwError('Unexpected end of data')
    }
    return num
  }

  /**
   * 获取下一个字符，并将位置标识符向后移动
   * @throws {Error} 数据意外结尾
   */
  protected getChar (): string {
    return String.fromCharCode(this.getNum())
  }

  /** 获取游戏列数 */
  getWidth (): number {
    return this.mInfo.width
  }

  /** 获取游戏行数 */
  getHeight (): number {
    return this.mInfo.height
  }

  /** 获取游戏雷数 */
  getMines (): number {
    return this.mInfo.mines
  }

  /** 获取游戏布局 */
  getBoard (): string[] {
    return this.mInfo.board
  }

  /** 获取游戏事件 */
  getEvents (): VideoEvent[] {
    return this.mInfo.events
  }

  /** 获取玩家名称原始数据 */
  getPlayer (): Uint8Array {
    return this.mInfo.player
  }
}
