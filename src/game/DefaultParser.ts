import { BaseParser } from '@/game/BaseParser'

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
  protected board = []
  protected mGameEvents = []
  protected mPlayerArray = new Uint8Array()
}
