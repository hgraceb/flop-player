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
  private mPlayer: Uint8Array = new Uint8Array()

  /** 设置游戏列数 */
  setWidth (width: number) {
    this.mWidth = width
  }

  /** 设置游戏行数 */
  setHeight (height: number) {
    this.mHeight = height
  }

  /** 设置游戏雷数 */
  setMines (mines: number) {
    this.mMines = mines
  }

  /** 设置游戏布局 */
  setBoard (board: string[]) {
    this.mBoard = board
  }

  /** 设置游戏事件 */
  setEvents (events: VideoEvent[]) {
    this.mEvents = events
  }

  /** 设置玩家名称原始数据 */
  setPlayer (player: Uint8Array) {
    this.mPlayer = player
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
