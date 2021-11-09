/**
 * 录像事件
 */
export class VideoEvent {
  x = 0
  y = 0
  mouse = 0
}

/**
 * 录像信息基础类
 */
export class Video {
  private mWidth = 0
  private mHeight = 0
  private mMines = 0
  private mBoard: string[] = []
  private mEvents: VideoEvent[] = []
  private mPlayer = new Uint8Array()
  private mOffset = 0
  private readonly mData = new Uint8Array()

  constructor (data: ArrayBuffer) {
    this.mData = new Uint8Array(data)
  }

  /** 设置游戏列数 */
  protected setWidth (width: number): void {
    this.mWidth = width
  }

  /** 设置游戏行数 */
  protected setHeight (height: number): void {
    this.mHeight = height
  }

  /** 设置游戏雷数 */
  protected setMines (mines: number): void {
    this.mMines = mines
  }

  /** 设置游戏布局 */
  protected setBoard (board: string[]): void {
    this.mBoard = board
  }

  /** 设置游戏事件 */
  protected setEvents (events: VideoEvent[]): void {
    this.mEvents = events
  }

  /** 设置玩家名称原始数据 */
  protected setPlayer (player: Uint8Array): void {
    this.mPlayer = player
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
    return this.mWidth
  }

  /** 获取游戏行数 */
  getHeight (): number {
    return this.mHeight
  }

  /** 获取游戏雷数 */
  getMines (): number {
    return this.mMines
  }

  /** 获取游戏布局 */
  getBoard (): string[] {
    return this.mBoard
  }

  /** 获取游戏事件 */
  getEvents (): VideoEvent[] {
    return this.mEvents
  }

  /** 获取玩家名称原始数据 */
  getPlayer (): Uint8Array {
    return this.mPlayer
  }
}
