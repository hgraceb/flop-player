/*****************************************************************
 Original script by Maksim Bashov 2014-04-18.

 Modified during 2019-02 by Damien Moore. Add Time and Status to Clone
 0.97 videos and deactivated several sections of code written for earlier
 versions but using incorrect assumptions. Changed 3bvs calculation to
 truncate instead of round.

 Modified by Damien Moore 2020-01-26. Rewrote the readmvf() function to
 correctly parse earlier versions. Program can now parse 8 different video
 formats: 2007, 2006, 0.97, 0.97 Funny Mode, 0.97 Unknown Hack, 0.8 to 0.96,
 0.76, and 0.75 or earlier. Tidied up code and wrote comments. This is being
 released as Clone (MVF) RAW version 6.

 Modified by Enbin Hu (Flop) 2021-11-17. Rewrote with TypeScript.

 Note Clone 2007 (not this program) has a bug where the day sometimes does not
 save correctly resulting in a value of 00. Also, Clone 0.97 beta sometimes
 saves the time 0.01s different than the actual end time per last mouse event.
 *****************************************************************/

import { Video, VideoEvent } from '@/game/video'

// 录像事件
class Event {
  sec = 0
  ths = 0
  x = 0
  y = 0
  lb = 0
  rb = 0
  mb = 0
  // Versions before 0.97 have an extra byte in each event
  weirdness_bit = 0
}

export class MVFVideo extends Video {
  protected mWidth = -1
  protected mHeight = -1
  protected mMines = -1
  protected mMarks = 0
  protected mBoard: number[] = []
  protected mEvents: VideoEvent[] = []
  protected mPlayer: Uint8Array = new Uint8Array()

  // Mode
  private mode = 0
  // Level
  private level = 0
  // Width
  private w = 0
  // Height
  private h = 0
  // Mines
  private m = 0
  // Number of game events
  private size = 0
  // Array to store board cells
  private board: number[] = []
  // Questionmarks
  private qm = 0
  // TRUE if Clone 0.97, 2006, 2007
  private has_date = 0
  // Timestamp
  private timestamp: string[] = []
  // Date variables taken from Timestamp
  private month = 0
  private year = 0
  private day = 0
  private hour = 0
  private minute = 0
  private second = 0
  // TRUE if Clone 0.97
  private has_info = 0
  // Stats only available in Clone 0.97 videos
  private bbbv = 0
  private lcl = 0
  private rcl = 0
  private dcl = 0
  private solved_bbbv = 0
  // Time in seconds and decimals
  private score_sec = 0
  private score_ths = 0
  // Player name
  private name: string[] = []
  // Program defined here instead of reading from video
  private readonly program = 'Minesweeper Clone'
  // Version
  private version = ''
  // Game events
  private video: Event[] = []
  // Cell size used in mouse movement calculations
  private readonly square_size = 16
  // 3bvs
  private bbbvs = 0.0

  constructor (data: ArrayBuffer) {
    super(data)
    // 解析 MVF 录像
    if (!this.readmvf()) {
      this.throwError('Invalid MVF')
    }
  }

  /**
   * Function to check version and parse if not standard Clone 0.97, 2006 or 2007
   */
  private readmvf () {
    // Initialise local variables
    let c = this.getChar()
    let d = this.getChar()
    return 0
  }
}
