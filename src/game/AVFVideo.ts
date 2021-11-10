/*****************************************************************
 Original script by Maksim Bashov 2012-10-23.

 Modified by ShenJia Zhang 2013-11-11. Added Time and 3BV.

 Modified during 2019-02 by Damien Moore. Added ELSE statements so Mode and Marks
 always print (so same number of lines in output), changed Version code to work with
 older versions and to retrieve the third part if it exists (i.e., 0.52.3 or 0.45
 DEBUG), added Style and BBBVS variables and tested parser with all versions since
 0.43 demo3. On 2019-02-22 fixed issue caused by Custom games having more bytes in
 the header. On 2019-02-24 fixed bug caused when score_ths has a leading zero. Also
 fixed errors with Time rounding versus truncating to 3 decimal places.

 Modified by Damien Moore 2020-01-24. Corrected minor error where the leading empty
 space in third part of Version was being deleted. Tidied up code and wrote comments.
 Modified 2020-02-07 to make backwards compatible to 0.35. This is being released as
 Arbiter RAW version 6.

 Updated 2021-05-26 by Damien to remove legacy Freesweeper code and remove Arbiter cheat
 code as Arbiter does not allow cheat mode videos.

 Modified by Enbin Hu (Flop) 2021-11-07. Rewriting with TypeScript.

 Note Arbiter internals operate to 2 decimal places. You cannot get 3 decimal places
 by subtracting timestamp_a from timestamp_b because these timestamps do not perfectly
 match start and finish of the game timer. This versions adds a fake 0 as the third
 decimal place for consistency with the other official minesweeper versions.

 Tested successfully on Arbiter 0.35 and later.
 *****************************************************************/

import { Video, VideoEvent } from '@/game/video'

// 游戏事件
class Event {
  // Seconds
  sec = 0
  // Hundredths
  hun = 0
  // Thousandths
  ths = 0
  x = 0
  y = 0
  mouse = 0
}

export class AVFVideo extends Video {
  // TODO 更新录像基本信息
  protected width = 0
  protected height = 0
  protected mines = 0
  protected board: number[] = []
  protected events: VideoEvent[]
  protected player: Uint8Array

  private readonly MAX_NAME = 1000
  // Mode
  private mode = 0
  // Number of game events
  private size = 0
  // Questionmarks
  private qm = false
  // Version
  private ver = 0
  // Player name
  private name: string[] = []
  // Skin (since version 0.47)
  private skin: string[] = []
  // Program
  private program: string[] = []
  // Used in getpair() function
  private value: string[] = []
  // Timestamp (when game started)
  private timestampA: string[] = []
  // Custom games have 4 extra bytes
  private customdata: string[] = []
  // Game events
  private video: Event[] = []
  // Time in seconds
  private scoreSec = 0
  // Time in decimals
  private scoreHun = 0
  // The period or space before 3rd part of Version
  private spacer = ''
  // Substring used to fetch Version
  private versionend: string[] = []
  // Substring used to fetch Version
  private versionprint: string[] = []
  // 3bv
  private bbbv = 0
  // Realtime (since version 0.47)
  private realtime = 0.0
  // 3bvs
  private bbbvs = 0.0

  constructor (data: ArrayBuffer) {
    super(data)
    // 解析 AVF 录像
    if (!this.readavf()) {
      this.throwError('Invalid AVF')
    }
    // 设置游戏事件
    this.events = Array.from(Array(this.size), () => <VideoEvent>{})
    let curx = 1
    let cury = 1
    for (let i = 0; i < this.size; ++i) {
      if (this.video[i].mouse === 1 && this.video[i].x === curx && this.video[i].y === cury) continue
      curx = this.video[i].x
      cury = this.video[i].y

      // //For consistency with other programs add fake 0 as third decimal
      // printf('%d.%02d0 ', this.video[i].sec, this.video[i].hun)
      //
      // if (this.video[i].mouse === 1)
      //   printf('mv ')
      // else if (this.video[i].mouse === 3)
      //   printf('lc ')
      // else if (this.video[i].mouse === 5)
      //   printf('lr ')
      // else if (this.video[i].mouse === 9)
      //   printf('rc ')
      // else if (this.video[i].mouse === 17)
      //   printf('rr ')
      // else if (this.video[i].mouse === 33)
      //   printf('mc ')
      // else if (this.video[i].mouse === 65)
      //   printf('mr ')
      // else if (this.video[i].mouse === 145)
      //   printf('rr ')
      // else if (this.video[i].mouse === 193)
      //   printf('mr ')
      // else if (this.video[i].mouse === 11)
      //   printf('sc ')
      // else if (this.video[i].mouse === 21)
      //   printf('lr ')
      // printf('%d %d (%d %d)\n', video[i].x / 16 + 1, video[i].y / 16 + 1, video[i].x, video[i].y)
    }
    // 设置玩家名称
    this.player = new Uint8Array(this.name.length)
    this.name.forEach((char, index) => {
      this.player[index] = char.charCodeAt(0)
    })
  }

  /**
   * 将字符串转换成整数
   *
   * @param str 要转换为整数的字符串
   * @return {number} 返回转换后的整数，如果没有执行有效的转换，则返回零
   */
  private static atoi (str: string): number {
    return parseInt(str) || 0
  }

  /**
   * Function is used to read Realtime and Skin values
   */
  private getpair (c1: string[], c2: string[]) {
    // Initialise local variables
    let i = 0
    let c = ''

    while (c !== ':' && c.charCodeAt(0) !== 13 && i < this.MAX_NAME) {
      c = this.getChar()
      if (c === '<') {
        c1.length = i
        c2 = []
        while (this.getNum() !== 13) {
        }
        return
      }
      c1[i++] = c
    }
    c1.length = --i
    i = 0

    while (c.charCodeAt(0) !== 13 && i < this.MAX_NAME) {
      c = this.getChar()
      c2[i++] = c
    }
    c2.length = i
  }

  /**
   * Function is used to read video data
   */
  private readavf () {
    // Initialise local variables
    let i: number
    let cur = 0
    let c: number
    let d = 0
    // Create an 8 byte array to store data
    const cr: number[] = new Array(8)

    // Fetch main version from byte 1
    // For example, Arbiter 0.52.2 stores 52 (Hex 34) in byte 1
    c = this.getNum()
    this.ver = c

    // Throw away next 4 bytes which are not used
    for (i = 0; i < 4; ++i) c = this.getNum()

    // Fetch Mode from byte 6
    c = this.getNum()
    this.mode = c - 2

    if (this.mode === 1) {
      this.width = this.height = 8
      this.mines = 10
    } else if (this.mode === 2) {
      this.width = this.height = 16
      this.mines = 40
    } else if (this.mode === 3) {
      this.width = 30
      this.height = 16
      this.mines = 99
    } else if (this.mode === 4) {
      this.width = (c = this.getNum()) + 1
      this.height = (c = this.getNum()) + 1
      this.mines = (c = this.getNum())
      this.mines = this.mines * 256 + (c = this.getNum())
    } else return 0

    // Fetch board layout and put in memory
    this.board = new Array(this.width * this.height).fill(0)
    for (i = 0; i < this.mines; ++i) {
      c = this.getNum() - 1
      d = this.getNum() - 1
      this.board[c * this.width + d] = 1
    }

    // Clear the 8 byte array we are using to store data
    for (i = 0; i < 7; ++i) cr[i] = 0

    // Search through bytes for timestamp which starts after the first '[' bracket
    // Note timestamp_a only became a full timestamp (with year and month) in version 0.46.1
    while (cr[3] !== '['.charCodeAt(0)) {
      cr[0] = cr[1]
      cr[1] = cr[2]
      cr[2] = cr[3]
      cr[3] = this.getNum()
    }
    cr[0] = cr[1]
    cr[1] = cr[2]
    cr[2] = cr[3]
    cr[3] = this.getNum()

    // See if Questionmark option was turned on
    if (cr[0] !== 17 && cr[0] !== 127) return 0
    this.qm = (cr[0] === 17)

    // Throw away the next byte (the first '[' before timestamp)
    this.getChar()

    // Fetch timestamp
    // Timestamp_a is when game starts, Timestamp_b is when game ends
    // Custom games add extra bytes here such as "W8H8M32" which need to be ignored
    if (this.mode === 4) {
      i = 0
      while (i < this.MAX_NAME) {
        if ((this.customdata[i++] = this.getChar()) === '|') {
          this.customdata.pop()
          break
        }
      }
      i = 0
      while (i < this.MAX_NAME) {
        if ((this.timestampA[i++] = this.getChar()) === '|') {
          this.timestampA.pop()
          break
        }
      }
    } else {
      i = 0
      while (i < this.MAX_NAME) {
        if ((this.timestampA[i++] = this.getChar()) === '|') {
          this.timestampA.pop()
          break
        }
      }
    }

    // Throw away bytes until you find letter B which is followed by the 3bv value
    while (this.getChar() !== 'B') {
    }

    // Clear the 8 byte array we are using to store data
    for (i = 0; i < 7; ++i) cr[i] = 0
    i = 0

    // Fetch 3BV
    while ((c = this.getNum())) {
      if (c === 'T'.charCodeAt(0)) break
      cr[i] = c
      i++
    }

    // Convert array string to an integer
    this.bbbv = AVFVideo.atoi(new TextDecoder().decode(new Uint8Array(cr)))

    // Clear the 8 byte array we are using to store data
    for (i = 0; i < 7; ++i) cr[i] = 0
    i = 0

    // Fetch the seconds part of time (stop at decimal) and subtract 1s for real time
    while ((c = this.getNum())) {
      if (c === '.'.charCodeAt(0) || c === ','.charCodeAt(0)) break
      cr[i] = c
      i++
    }

    // Convert array string to an integer
    this.scoreSec = AVFVideo.atoi(new TextDecoder().decode(new Uint8Array(cr))) - 1

    // Clear the 8 byte array we are using to store data
    for (i = 0; i < 7; ++i) cr[i] = 0
    i = 0

    // Fetch the decimal part of Time (2 decimal places)
    while ((c = this.getNum())) {
      if (c === ']'.charCodeAt(0)) break
      cr[i] = c
      i++
    }

    // Convert array string to an integer
    this.scoreHun = AVFVideo.atoi(new TextDecoder().decode(new Uint8Array(cr)))

    // Clear the 8 byte array we are using to store data
    for (i = 0; i < 7; ++i) cr[i] = 0

    // This skips bytes until first mouse event takes place
    while (cr[2] !== 1 || cr[1] > 1) {
      cr[0] = cr[1]
      cr[1] = cr[2]
      cr[2] = this.getNum()
    }
    for (i = 3; i < 8; ++i) cr[i] = this.getNum()

    // Each iteration reads one mouse event
    while (1) {
      this.video[cur] = new Event()
      this.video[cur].mouse = cr[0]
      this.video[cur].x = cr[1] * 256 + cr[3]
      this.video[cur].y = cr[5] * 256 + cr[7]
      this.video[cur].sec = cr[6] * 256 + cr[2] - 1
      this.video[cur].hun = cr[4]

      if (this.video[cur].sec < 0) break

      for (i = 0; i < 8; ++i) cr[i] = this.getNum()
      ++cur
    }

    // Number of game events
    this.size = cur

    // Clear a 4 byte array
    for (i = 0; i < 3; ++i) cr[i] = 0

    // Find 'cs=' in the video file (this identifies start of text at end of video)
    while (cr[0] !== 'c'.charCodeAt(0) || cr[1] !== 's'.charCodeAt(0) || cr[2] !== '='.charCodeAt(0)) {
      cr[0] = cr[1]
      cr[1] = cr[2]
      cr[2] = this.getNum()
    }

    // Throw away the bytes after "cs=" but before "Realtime"
    for (i = 0; i < 17; ++i) this.getChar()

    // Infinite loop until break statement is made
    // Note that Realtime and Skin do not exist before version 0.47
    while (1) {
      this.getpair(this.name, this.value)
      // Stop grabbing pairs of data once Skin has been read
      if (this.value[0]) {
        // If name is Skin then strcmp returns 0, using !strcmp returns 1
        if (this.name.join('') === 'Skin') {
          // The addition of 1 removes the leading whitespace
          this.skin = this.value.slice(1)
        }
      } else {
        break
      }
    }

    // Fetch Program
    i = 0
    while (i < this.MAX_NAME) {
      if ((this.program[i++] = this.getChar()) === '0') {
        this.program.length = --i
        break
      }
    }

    // Start the process of fetching Version, such as '0.52.3'
    // Since we print 0 later and already fetched 52 as ver, throw away the '.52'
    i = 0
    for (i = 0; i < 3; ++i) this.getChar()

    // Store next byte which will be a period or blank space depending on version
    this.spacer = this.getChar()

    // Fetch 10 more bytes (this is longer than longest known last part of version)
    // Read into an array (ie, '0.52.3. Copyright' would put '3. Copyrig' in array)
    for (i = 0; i < 10; ++i) {
      this.versionend[i] = this.getChar()
    }

    // Second step is transfer to a different array then parse up until the period or Copyright
    // Versions since 0.43 end with a period before the Copyright notice (ie, '0.43 demo3.')
    for (i = 0; i < this.MAX_NAME; ++i) {
      if (this.versionend[i] !== '.' && this.versionend[i] !== 'C') {
        this.versionprint[i] = this.versionend[i]
      }
    }
    return 1
  }
}
