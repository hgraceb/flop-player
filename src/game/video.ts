/**
 * 录像事件信息，参考自：https://minesweepergame.com/forum/viewtopic.php?f=26&t=86
 */
export interface VideoEvent {
  time: number
  // <left_click> | <left_release> | <right_click> | <right_release> | <middle_click> | <middle_release> | <mouse_move> | <left_click_with_shift> | <toggle_question_mark_setting>
  mouse: 'lc' | 'lr' | 'rc' | 'rr' | 'mc' | 'mr' | 'mv' | 'sc' | 'mt'
  column: number
  row: number
  x: number
  y: number
}

/**
 * 录像信息基础类
 */
export abstract class Video {
  private mOffset = 0
  private readonly mData = new Uint8Array()

  protected abstract mWidth: number
  protected abstract mHeight: number
  protected abstract mMines: number
  protected abstract mBoard: number[]
  protected abstract mEvents: VideoEvent[]
  protected abstract mPlayer: Uint8Array

  protected constructor (data: ArrayBuffer) {
    this.mData = new Uint8Array(data)
  }

  /** 抛出一个错误 */
  protected throwError (msg: string): number {
    throw new Error(`${this.constructor.name}Error - ${msg}`)
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
  getBoard (): number[] {
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
