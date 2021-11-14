import { Video, VideoEvent } from '@/game/video'

export class RawVideo extends Video {
  protected mWidth = 8
  protected mHeight = 8
  protected mMines = 10
  protected mMarks = 0
  protected mBoard: number[] = []
  protected mEvents: VideoEvent[] = []
  protected mPlayer: Uint8Array = new Uint8Array()

  constructor (data: ArrayBuffer) {
    super(data)
    for (let i = 0; i < 1000; i++) {
      let line
      while ((line = this.getLine())) {
        console.log(`'${new TextDecoder().decode(line)}'`)
      }
    }
  }
}
