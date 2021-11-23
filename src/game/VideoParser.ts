import { BaseParser, GameEvent } from '@/game/BaseParser'
import { BaseVideo } from '@/game/BaseVideo'

/**
 * 录像事件解析器
 */
export class VideoParser extends BaseParser {
  /* 基础录像数据 */
  protected mWidth: number
  protected mHeight: number
  protected mMines: number
  protected mPlayerArray: Uint8Array
  /* 通过二次计算得到的录像数据 */
  protected mBBBV = 0
  protected mIslands = 0
  protected mOpenings = 0
  protected mGZiNi = 0
  protected mHZiNi = 0
  protected mGameEvents: GameEvent[] = []

  constructor (video: BaseVideo) {
    super()
    this.mWidth = video.getWidth()
    this.mHeight = video.getHeight()
    this.mMines = video.getMines()
    this.mPlayerArray = video.getPlayer()
    this.parse(video)
  }

  private parse (video: BaseVideo) {
  }
}
