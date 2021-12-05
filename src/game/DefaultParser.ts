import { BaseParser, Cell, GameEvent } from '@/game/BaseParser'

/**
 * 默认录像事件解析器，不包含实际数据
 */
export class DefaultParser extends BaseParser {
  protected readonly mWidth = 8
  protected readonly mHeight = 8
  protected readonly mMines = 0
  protected readonly mMarks = false
  protected readonly mBBBV = 0
  protected readonly mIslands = 0
  protected readonly mOpenings = 0
  protected readonly mVideoBoard: number[] = []
  protected readonly mGameBoard: Cell[] = []
  // 包含一个录像结束标识事件，不然播放时无法正常结束
  protected readonly mGameEvents: GameEvent [] = [new GameEvent('UnexpectedEnd')]
  protected readonly mPlayerArray = new Uint8Array()

  appendEvent (): GameEvent[] {
    return this.mGameEvents
  }
}
