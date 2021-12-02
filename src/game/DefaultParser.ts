import { BaseParser, Cell, GameEvent } from '@/game/BaseParser'

/**
 * 默认录像事件解析器，不包含实际数据
 */
export class DefaultParser extends BaseParser {
  protected mWidth = 8
  protected mHeight = 8
  protected mMines = 0
  protected mBBBV = 0
  protected mIslands = 0
  protected mOpenings = 0
  protected mVideoBoard: number[] = []
  protected mGameBoard: Cell[] = []
  // 包含一个录像结束标识事件，不然播放时无法正常结束
  protected mGameEvents: GameEvent [] = [new GameEvent('UnexpectedEnd')]
  protected mPlayerArray = new Uint8Array()

  appendEvent (): GameEvent[] {
    return this.mGameEvents
  }
}
