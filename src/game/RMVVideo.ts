/*****************************************************************
 Original script by Maksim Bashov 2012-10-23.

 Modified during 2019-02 by Damien Moore. Split Program string to extract Version
 and added Time, 3BV, 3BVS, Timestamp, Style, Questionmarks and Status. On 2019-02-24
 fixed method for printing mouse event times. On 2019-03-04 made program backwards
 compatible with Release 2.2 and earlier versions that have a shorter header.

 Modified 2020-01-25 by Damien Moore as Release 2 beta and earlier versions do not have
 3bv, 3bvs or Timestamp values. Tidied code and wrote detailed comments. On 2020-02-03
 fixed a major bug that caused Solved 3BV (in RAWVF2RAWVF) to be incorrect in certain
 videos. This bug occurred when using event[cur++] in the function used to create the
 missing first left click (since Viennasweeper does not record mouse event prior to the
 time starting and it is the release of the button that starts the timer). This version
 is being released as Viennasweeper (RMV) RAW version 6.

 Additional update 2021-05-24 per Tommy to add 3 new fields (nick, country, token) for
 Viennasweeper 3.1.

 Modified by Enbin Hu (Flop) 2021-11-19. Rewrote with TypeScript.

 Works on all known RMV versions but not earlier UMF files.
 *****************************************************************/

import { BaseVideo, VideoEvent } from '@/game/BaseVideo'

export class RMVVideo extends BaseVideo {
  protected mWidth = -1
  protected mHeight = -1
  protected mMines = -1
  protected mMarks = 0
  protected mBoard: number[] = []
  protected mEvents: VideoEvent[] = []
  protected mPlayer: Uint8Array = new Uint8Array()

  constructor (data: ArrayBuffer) {
    super(data)
    // 解析 RMV 录像
    if (!this.readrmv()) {
      this.error('Invalid RMV')
    }
  }

  /**
   * Function is used to read video data
   */
  private readrmv () {
    return false
  }
}
