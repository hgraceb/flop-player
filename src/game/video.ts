/**
 * 录像事件信息，参考自：https://minesweepergame.com/forum/viewtopic.php?f=26&t=86
 */
export interface VideoEvent {
  // 当前时间，单位：毫秒
  time: number
  // <left_click> | <left_release> | <right_click> | <right_release> | <middle_click> | <middle_release> | <mouse_move> | <left_click_with_shift> | <toggle_question_mark_setting>
  mouse: 'lc' | 'lr' | 'rc' | 'rr' | 'mc' | 'mr' | 'mv' | 'sc' | 'mt'
  // 当前列，从 0 开始
  column: number
  // 当前行，从 0 开始
  row: number
  // X 轴精确坐标
  x: number
  // Y 轴精确坐标
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
  protected abstract mMarks: number
  protected abstract mBoard: number[]
  protected abstract mEvents: VideoEvent[]
  protected abstract mPlayer: Uint8Array

  protected constructor (data: ArrayBuffer) {
    this.mData = new Uint8Array(data)
  }

  /** 抛出一个错误 */
  protected error (msg: string): number {
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
      this.error('Unexpected end of data')
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

  /**
   * 获取下一行字符，并将位置标识符向后移动
   * @param {number} max 读取的最大字符数，默认为 1000
   * @return {Uint8Array|null} 下一行字符
   */
  protected getLine (max = 1000): Uint8Array | null {
    // 没有下一行字符
    if (this.mOffset >= this.mData.length) return null
    // 获取下一行字符
    const line: Uint8Array = new Uint8Array(max)
    let num
    let i = 0
    while ((num = this.getNum()) !== 10 && i < max && this.mOffset < this.mData.length) {
      line[i++] = num
    }
    // 只保留有效字符（不包括换行符）
    return line.slice(0, i)
  }

  /**
   * 移动二进制数据的读写位置
   *
   * @param offset 相对 whence 的偏移量，以字节为单位
   * @param whence 开始添加偏移 offset 的位置
   */
  protected seek (offset: number, whence: 'SEEK_SET' | 'SEEK_CUR' | 'SEEK_END') {
    switch (whence) {
      case 'SEEK_SET':
        this.mOffset = offset
        break
      case 'SEEK_CUR':
        this.mOffset += offset
        break
      case 'SEEK_END':
        this.mOffset = this.mData.length - offset
        break
    }
  }

  /**
   * 返回位置标识符的当前值
   */
  protected getOffset () {
    return this.mOffset
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

  /** 获取是否标记问号 */
  getMarks (): number {
    return this.mMarks
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
