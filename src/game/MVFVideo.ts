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
  weirdnessBit = 0
}

export class MVFVideo extends Video {
  protected mWidth: number
  protected mHeight: number
  protected mMines: number
  protected mMarks: number
  protected mBoard: number[]
  protected mPlayer: Uint8Array
  protected mEvents: VideoEvent[] = []

  private readonly MAX_REP = 100000
  private readonly MAX_NAME = 1000
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
  private hasDate = 0
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
  private hasInfo = 0
  // Stats only available in Clone 0.97 videos
  private bbbv = 0
  private lcl = 0
  private rcl = 0
  private dcl = 0
  private solvedBBBV = 0
  // Time in seconds and decimals
  private scoreSec = 0
  private scoreThs = 0
  // Player name
  private name: number[] = []
  // Program defined here instead of reading from video
  private readonly program = 'Minesweeper Clone'
  // Version
  private version = ''
  // Game events
  private video: Event[] = []
  // Cell size used in mouse movement calculations
  private readonly squareSize = 16
  // 3bvs
  private bbbvs = 0.0

  constructor (data: ArrayBuffer) {
    super(data)
    // 解析 MVF 录像
    if (!this.readmvf()) {
      this.error('Invalid MVF')
    }
    // 设置游戏基本信息
    this.mWidth = this.w
    this.mHeight = this.h
    this.mMines = this.m
    this.mMarks = this.qm
    this.mBoard = this.board
    // 设置玩家名称
    this.mPlayer = new Uint8Array(this.name)
    // 设置游戏事件
    this.dumpFirstEvent(this.video[0])
    for (let i = 1; i < this.size; i++) {
      this.dumpEvent(this.video[i], this.video[i - 1])
    }
  }

  private getInt2 () {
    const c = []
    c[0] = this.getNum()
    c[1] = this.getNum()
    // This code reads 2 bytes and puts them in a 4 byte int
    // You cannot "add" bytes in the normal sense, instead you perform shift operations
    // Multiplying by 256 is the same as shifting left by 1 byte (8 bits)
    // The result is c[0] is moved to int byte 3 while c[1] stayes in int byte 4
    return c[1] + c[0] * 256
  }

  private getInt3 () {
    const c = []
    c[0] = this.getNum()
    c[1] = this.getNum()
    c[2] = this.getNum()
    return c[2] + c[1] * 256 + c[0] * 65536
  }

  /**
   * Function to read board layout into memory
   */
  private readBoard (add: number) {
    let c
    let i, pos
    this.w = this.getNum()
    this.h = this.getNum()

    const boardSize = this.w * this.h
    for (i = 0; i < boardSize; ++i) this.board[i] = 0

    // Get number of Mines
    c = this.getNum()
    this.m = c << 8
    c = this.getNum()
    this.m += c

    for (i = 0; i < this.m; ++i) {
      c = this.getNum()
      pos = c + add
      c = this.getNum()
      pos += (c + add) * this.w
      if (pos >= boardSize || pos < 0) this.error('Invalid mine position')
      this.board[pos] = 1
    }
  }

  /**
   * Functions to read mouse events
   */

  // Put event bytes into e variable
  private readEvent (size: number, e: number[]) {
    for (let i = 0; i < size; ++i) e[i] = this.getNum()
  }

  // Time
  private readScore () {
    const c = this.getNum()
    const d = this.getNum()
    this.scoreSec = c * 256 + d
    this.scoreThs = 10 * this.getNum()
  }

  // Decode event
  private applyPerm (num: number, byte: number[], bit: number[], event: number[]) {
    return (event[byte[num]] & bit[num]) ? 1 : 0
  }

  /**
   * Function to read Clone 0.97 videos
   */
  private read097 () {
    // Initialise local variables
    let s = ''
    const byte: number[] = []
    const bit: number[] = []
    const mult = 100000000
    const e: number[] = []

    // Clone 0.97 has Date (Timestamp)
    this.hasDate = 1
    this.hasInfo = 1

    // Read Date (Timestamp)
    this.month = this.getNum()
    this.day = this.getNum()
    this.year = this.getInt2()
    this.hour = this.getNum()
    this.minute = this.getNum()
    this.second = this.getNum()

    // Next 2 bytes are Level and Mode
    this.level = this.getNum()
    this.mode = this.getNum()

    // Next 3 bytes are Time
    this.readScore()

    // Next 11 bytes provide stats only available to Clone 0.97
    this.bbbv = this.getInt2() // 3bv
    this.solvedBBBV = this.getInt2() // Solved 3bv
    this.lcl = this.getInt2() // Left clicks
    this.dcl = this.getInt2() // Double clicks
    this.rcl = this.getInt2() // Right clicks

    // Check if Questionmark option was turned on
    this.qm = this.getNum()

    // Function gets Width, Height and Mines then reads board layout into memory
    this.readBoard(-1)

    // Byte before Player gives length of name
    const len = this.getNum()
    for (let i = 0; i < len; ++i) this.name[i] = this.getNum()

    // First 2 bytes determine the file permutation
    const leading = this.getInt2()
    const num1 = Math.sqrt(leading)
    const num2 = Math.sqrt(leading + 1000.0)
    const num3 = Math.sqrt(num1 + 1000.0)
    s += ('00000000' + Math.round(Math.abs(Math.cos(num3 + 1000.0) * mult))).slice(-8)
    s += ('00000000' + Math.round(Math.abs(Math.sin(Math.sqrt(num2)) * mult))).slice(-8)
    s += ('00000000' + Math.round(Math.abs(Math.cos(num3) * mult))).slice(-8)
    s += ('00000000' + Math.round(Math.abs(Math.sin(Math.sqrt(num1) + 1000.0) * mult))).slice(-8)
    s += ('00000000' + Math.round(Math.abs(Math.cos(Math.sqrt(num2 + 1000.0)) * mult))).slice(-8)
    let cur = 0
    for (let i = '0'.charCodeAt(0); i <= '9'.charCodeAt(0); ++i) {
      for (let j = 0; j < 40; ++j) {
        if (s.charCodeAt(j) === i) {
          // 向下取整
          byte[cur] = Math.floor(j / 8)
          bit[cur++] = 1 << (j % 8)
        }
      }
    }

    // Get number of bytes that store mouse events
    this.size = this.getInt3()
    if (this.size >= this.MAX_REP) this.error('Too large video')

    // Read mouse events
    for (let i = 0; i < this.size; ++i) {
      this.readEvent(5, e)

      this.video[i] = <Event>{}
      this.video[i].rb = this.applyPerm(0, byte, bit, e)
      this.video[i].mb = this.applyPerm(1, byte, bit, e)
      this.video[i].lb = this.applyPerm(2, byte, bit, e)
      this.video[i].x = this.video[i].y = this.video[i].ths = this.video[i].sec = 0
      for (let j = 0; j < 9; ++j) {
        this.video[i].x |= (this.applyPerm(12 + j, byte, bit, e) << j)
        this.video[i].y |= (this.applyPerm(3 + j, byte, bit, e) << j)
      }
      for (let j = 0; j < 7; ++j) this.video[i].ths |= (this.applyPerm(21 + j, byte, bit, e) << j)
      this.video[i].ths *= 10
      for (let j = 0; j < 10; ++j) this.video[i].sec |= (this.applyPerm(28 + j, byte, bit, e) << j)
    }
    return 1
  }

  /**
   * Function to read Clone 2006 and 2007 videos
   */
  private read2007 () {
    // Initialise local variables
    let s = ''
    const byte: number[] = []
    const bit: number[] = []
    const mult = 100000000
    const e: number[] = []

    // Clone 2006 and 2007 have Date (Timestamp)
    this.hasDate = 1
    this.hasInfo = 0

    // Read Date (Timestamp)
    this.month = this.getNum()
    this.day = this.getNum()
    this.year = this.getInt2()
    this.hour = this.getNum()
    this.minute = this.getNum()
    this.second = this.getNum()

    // Next 2 bytes are Level and Mode
    this.level = this.getNum()
    this.mode = this.getNum()

    // Next 3 bytes are Time
    this.scoreThs = this.getInt3()
    // 向下取整
    this.scoreSec = Math.floor(this.scoreThs / 1000)
    this.scoreThs %= 1000

    // Check if Questionmark option was turned on
    this.qm = this.getNum()

    // Function gets Width, Height and Mines then reads board layout into memory
    this.readBoard(-1)

    // Byte before Player gives length of name
    let len = this.getNum()
    if (len >= this.MAX_NAME) len = this.MAX_NAME - 1
    for (let i = 0; i < len; ++i) this.name[i] = this.getNum()

    // First 2 bytes determine the file permutation
    const leading = this.getInt2()
    const num1 = Math.sqrt(leading)
    const num2 = Math.sqrt(leading + 1000.0)
    const num3 = Math.sqrt(num1 + 1000.0)
    const num4 = Math.sqrt(num2 + 1000.0)
    s += ('00000000' + Math.round(Math.abs(Math.cos(num3 + 1000.0) * mult))).slice(-8)
    s += ('00000000' + Math.round(Math.abs(Math.sin(Math.sqrt(num2)) * mult))).slice(-8)
    s += ('00000000' + Math.round(Math.abs(Math.cos(num3) * mult))).slice(-8)
    s += ('00000000' + Math.round(Math.abs(Math.sin(Math.sqrt(num1) + 1000.0) * mult))).slice(-8)
    s += ('00000000' + Math.round(Math.abs(Math.cos(num4) * mult))).slice(-8)
    s += ('00000000' + Math.round(Math.abs(Math.sin(num4) * mult))).slice(-8)
    let cur = 0
    for (let i = '0'.charCodeAt(0); i <= '9'.charCodeAt(0); ++i) {
      for (let j = 0; j < 48; ++j) {
        if (s.charCodeAt(j) === i) {
          // 向下取整
          byte[cur] = Math.floor(j / 8)
          bit[cur++] = 1 << (j % 8)
        }
      }
    }

    // Get number of bytes that store mouse events
    this.size = this.getInt3()
    if (this.size >= this.MAX_REP) this.error('Too large video')

    // Read mouse events
    for (let i = 0; i < this.size; ++i) {
      this.readEvent(6, e)

      this.video[i] = <Event>{}
      this.video[i].rb = this.applyPerm(0, byte, bit, e)
      this.video[i].mb = this.applyPerm(1, byte, bit, e)
      this.video[i].lb = this.applyPerm(2, byte, bit, e)
      this.video[i].x = this.video[i].y = this.video[i].ths = this.video[i].sec = 0
      for (let j = 0; j < 11; ++j) {
        this.video[i].x |= (this.applyPerm(14 + j, byte, bit, e) << j)
        this.video[i].y |= (this.applyPerm(3 + j, byte, bit, e) << j)
      }
      for (let j = 0; j < 22; ++j) this.video[i].ths |= (this.applyPerm(25 + j, byte, bit, e) << j)
      // 向下取整
      this.video[i].sec = Math.floor(this.video[i].ths / 1000)
      this.video[i].ths %= 1000
      this.video[i].x -= 32
      this.video[i].y -= 32
    }
    return 1
  }

  /**
   * Function to check version and parse if not standard Clone 0.97, 2006 or 2007
   */
  private readmvf () {
    // Initialise local variables
    let c: number | string = this.getNum()
    let d = this.getNum()

    // Perform version checks
    // Prior to Clone 0.97 first 2 bytes were Width and Height (so 08,10,1E)
    // Early versions also did not allow Custom videos to be saved in Legal Mode
    if (c === 0x11 && d === 0x4D) {
      // The byte after offset 27 in "new" versions is last digit of year
      this.seek(27, 'SEEK_SET')
      c = this.getChar()

      // Clone 0.97
      if (c === '5') {
        // Relevant data starts from offset 74
        this.seek(74, 'SEEK_SET')
        this.version = '0.97 beta'
        return this.read097()
        // Clone 2006 or 2007
      } else if (c === '6' || c === '7') {
        this.seek(53, 'SEEK_SET')
        c = this.getNum()
        for (d = 0; d < c; ++d) this.version += this.getChar()
        // Relevant data starts from offset 71
        this.seek(71, 'SEEK_SET')
        return this.read2007()
        // Clone 0.97 Funny Mode hack by Abiu in June 2008
      } else if (c === '8') {
        // Relevant data starts from offset 74
        this.seek(74, 'SEEK_SET')
        this.version = '0.97 Funny Mode Hack'
        c = this.read097()
        // All Funny Mode videos are UPK
        this.mode = 3
        return c
      }
      // Clone 0.97 hack by an unknown person
    } else if (c === 0x00 && d === 0x00) {
      this.seek(7, 'SEEK_SET')
      this.version = '0.97 Unknown Hack'
      return this.read097()
      // Clone 0.96 and earlier versions do not have a header
      // Clone 0.76 introduced 100 bytes for the Player name (default is 'Minesweeper Clone')
      // Clone 0.76 and earlier end with 10 bytes containing a numeric Checksum
      // Clone 0.8 replaced 10 byte checksum with 22 bytes (00, 20 byte Checksum, 00)
      // The 3 bytes before Player name and Checksum are the Time
    } else {
      // Initialise local variables
      const e: number[] = []
      let afterEvents

      // There is no header so read from start of file
      this.seek(0, 'SEEK_SET')

      // Function reads Width, Height, Mines and the X,Y for each Mine
      this.readBoard(0)

      // Check if Questionmark option was turned on
      this.qm = c = this.getNum()

      // Throw away byte
      c = this.getNum()

      // Store current byte position for later when reading mouse events
      let current = this.getOffset()

      // Get number of bytes in file
      this.seek(0, 'SEEK_END')
      const filesize = this.getOffset()

      // Check if 20 byte checksum is bookended by zero
      this.seek(filesize - 1, 'SEEK_SET')
      const checksumA = this.getNum()
      this.seek(filesize - 22, 'SEEK_SET')
      const checksumB = this.getNum()

      if ((checksumA < '0'.charCodeAt(0) || checksumA > '9'.charCodeAt(0)) && (checksumB < '0'.charCodeAt(0) || checksumB > '9'.charCodeAt(0))) {
        this.version = '0.96 beta (or earlier)'

        // Set pointer to get Time later
        afterEvents = filesize - 125

        // Get Player name
        this.seek(filesize - 122, 'SEEK_SET')
        for (let i = 0; i < 100; ++i) this.name[i] = this.getNum()
      } else {
        // Assumption is last 3 bytes of 100 byte of Player name are blank
        this.seek(filesize - 13, 'SEEK_SET')

        if (this.getChar() === ' ' && this.getChar() === ' ' && this.getChar() === ' ') {
          this.version = '0.76 beta'

          // Set pointer to get Time later
          afterEvents = filesize - 113

          // Get Player name
          this.seek(filesize - 110, 'SEEK_SET')
          for (let i = 0; i < 100; ++i) this.name[i] = this.getNum()
        } else {
          this.version = '0.75 beta (or earlier)'

          // Set pointer to get Time later
          afterEvents = filesize - 13
        }
      }

      // Early versions did not have Date (Timestamp)
      this.hasInfo = 0
      this.hasDate = 0

      // Early versions only have Classic Mode
      this.mode = 1

      // Get Width and Height
      if (this.w === 8 && this.h === 8) this.level = 1
      else if (this.w === 16 && this.h === 16) this.level = 2
      else if (this.w === 30 && this.h === 16) this.level = 3
      else this.error('Invalid board size')

      // Get Time (3 bytes)
      this.seek(afterEvents, 'SEEK_SET')
      this.readScore()

      // Read mouse events
      this.seek(current, 'SEEK_SET')
      while (current <= afterEvents) {
        this.readEvent(8, e)

        this.video[this.size] = <Event>{}
        this.video[this.size].sec = e[0]
        this.video[this.size].ths = e[1] * 10

        if (this.size > 0 &&
          (this.video[this.size].sec < this.video[this.size - 1].sec ||
            (this.video[this.size].sec === this.video[this.size - 1].sec && this.video[this.size].ths < this.video[this.size - 1].ths))) {
          break
        }
        if (this.video[this.size].sec > this.scoreSec ||
          (this.video[this.size].sec === this.scoreSec && this.video[this.size].ths > this.scoreThs)) {
          break
        }

        this.video[this.size].lb = e[2] & 0x01
        this.video[this.size].mb = e[2] & 0x02
        this.video[this.size].rb = e[2] & 0x04
        this.video[this.size].x = e[3] * 256 + e[4]
        this.video[this.size].y = e[5] * 256 + e[6]
        this.video[this.size++].weirdnessBit = e[7]
        current += 8
        if (this.size >= this.MAX_REP) this.error('Too large video')
      }

      this.video[this.size].lb = this.video[this.size].mb = this.video[this.size].rb = 0
      this.video[this.size].x = this.video[this.size - 1].x
      this.video[this.size].y = this.video[this.size - 1].y
      this.video[this.size].sec = this.video[this.size - 1].sec
      this.video[this.size].ths = this.video[this.size - 1].ths
      ++this.size
      if (this.size >= this.MAX_REP) this.error('Too large video')
      return 1
    }
    return 0
  }

  /**
   * Function to dump first mouse event
   *
   * Clone does not save mouse events before timer starts (on button release)
   * This creates the missing button press by cloning details from the first event
   */
  private dumpFirstEvent (e: Event) {
    let ev: 'lc' | 'rc' | 'mc' | 'mv' | undefined
    if (e.lb) ev = 'lc'
    if (e.rb) ev = 'rc'
    if (e.mb) ev = 'mc'
    if (!ev) ev = 'mv'
    this.mEvents.push({
      time: e.sec * 1000 + e.ths,
      mouse: ev,
      column: Math.floor(e.x / this.squareSize),
      row: Math.floor(e.y / this.squareSize),
      x: e.x,
      y: e.y
    })
  }

  /**
   * Function to dump rest of mouse events
   */
  private dumpEvent (e: Event, prevE: Event) {
    let numEvents = 0
    const evs: ('mv' | 'lc' | 'rc' | 'mc' | 'lr' | 'rr' | 'mr')[] = []

    if (e.x !== prevE.x || e.y !== prevE.y) evs[numEvents++] = 'mv'
    if (e.lb && !prevE.lb) evs[numEvents++] = 'lc'
    if (e.rb && !prevE.rb) evs[numEvents++] = 'rc'
    if (e.mb && !prevE.mb) evs[numEvents++] = 'mc'
    if (!e.lb && prevE.lb) evs[numEvents++] = 'lr'
    if (!e.rb && prevE.rb) evs[numEvents++] = 'rr'
    if (!e.mb && prevE.mb) evs[numEvents++] = 'mr'

    for (let i = 0; i < numEvents; ++i) {
      this.mEvents.push({
        time: e.sec * 1000 + e.ths,
        mouse: evs[i],
        column: Math.floor(e.x / this.squareSize),
        row: Math.floor(e.y / this.squareSize),
        x: e.x,
        y: e.y
      })
    }
  }
}
