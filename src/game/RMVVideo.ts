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

interface Event {
  time: number
  x: number
  y: number
  event: number
}

export class RMVVideo extends BaseVideo {
  protected mWidth: number
  protected mHeight: number
  protected mMines: number
  protected mMarks: number
  protected mBoard: number[]
  protected mPlayer: Uint8Array
  protected mEvents: VideoEvent[] = []

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
  // Stores board and mine locations
  private board: number[] = []
  // Questionmarks
  private qm = 0
  // Style
  private nf = 0
  // Player name
  private name: number[] = []
  // Player nickname
  private nick: number[] = []
  // Player country
  private country: number[] = []
  // Player token
  private token: number[] = []
  // Program
  private program = ''
  // Version string
  private version = ''
  // Substring of Version
  private verstring = ''
  // Substring of Version
  private verlength = ''
  // Timestamp
  private timestamp = ''
  // Game events
  private video: Event[] = []
  // Cell size used in mouse movement calculations
  private readonly squareSize = 16
  // Time
  private score = 0
  // Boolean used to check if Time found from game events
  private scoreCheck = 0
  // 3bv as a string
  private bbbv: string[] = []
  // 3bv as an integer
  private bbbvint = 0
  // 3bvs during calculations
  private bbbvs = 0
  // 3bvs with decimals
  private bbbvsFinal = 0.0

  constructor (data: ArrayBuffer) {
    super(data)
    // 解析 RMV 录像
    if (!this.readrmv()) {
      this.error('Invalid RMV')
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
    const eventNames: ('mv' | 'lc' | 'lr' | 'rc' | 'rr' | 'mc' | 'mr')[] = ['mv', 'lc', 'lr', 'rc', 'rr', 'mc', 'mr']
    for (let i = 0; i < this.size; ++i) {
      const e = this.video[i]
      // Mouse event
      if (e.event >= 1 && e.event <= 7) {
        this.mEvents.push({
          time: e.time,
          mouse: eventNames[e.event - 1],
          column: Math.floor(e.x / this.squareSize),
          row: Math.floor(e.y / this.squareSize),
          x: e.x,
          y: e.y
        })
      }
    }
  }

  /**
   * Function is used to read video data
   */
  private readrmv () {
    // Initialise local variables
    let i
    let cur = 0
    let c, d
    const header1 = '*rmv'
    let nameLength
    let nickLength
    let countryLength
    let tokenLength
    let numPreflags
    let isFirstEvent = 1

    // Check first 4 bytes of header is *rmv
    for (i = 0; i < 4; ++i) if ((c = this.getChar()) !== header1[i]) this.error('No RMV header')

    // The getint2 function reads 2 bytes at a time
    // In legitimate videos byte 4=0 and byte 5=1, getint2 sum is thus 1
    if (this.getInt2() !== 1) this.error('Invalid video type')

    // The getint functions reads 4 bytes at a time
    this.getInt() // Gets byte 6-9, fs
    const resultStringSize = this.getInt2() // Gets bytes 10-11. Value gives string length starting at LEVEL in header
    const versionInfoSize = this.getInt2() // Gets bytes 12-13. Value gives string length starting at Viennasweeper in header
    this.getInt2() // Gets bytes 14-15, playerInfoSize. Value gives string length starting at Name in header
    this.getInt2() // Gets bytes 16-17, boardSize
    const preflagsSize = this.getInt2() // Gets bytes 18-19
    const propertiesSize = this.getInt2() // Gets bytes 20-21
    this.getInt() // Gets bytes 22-25, vidSize
    this.getInt2() // Gets bytes 26-27, csSize
    this.getNum() // Gets byte 28 which is a newline

    // Length of result_string_size starts 3 bytes before 'LEVEL' and ends on the '#' before Version
    // Version 2.2 was first to have a full length header
    // Earlier versions could have maximum header length of 35 bytes if Intermediate and 9999.99
    // This means it is Version 2.2 or later so we want to parse more of the header
    if (resultStringSize > 35) {
      // Reads last part of string after '3BV'
      for (i = 0; i < resultStringSize - 32; ++i) this.getNum()

      // Fetch those last 3 bytes which should contain 3bv (either :xx or xxx)
      // Note that lost games save 0 as the 3BV value
      for (i = 0; i < 3; ++i) this.bbbv[i] = this.getChar()
      if (!this.isDigit(this.bbbv[0])) this.bbbv[0] = ' '
      if (!this.isDigit(this.bbbv[1])) this.bbbv[1] = ' '
      if (!this.isDigit(this.bbbv[2])) this.bbbv[2] = ' '

      // Throw away some bytes to get to Timestamp
      for (i = 0; i < 16; ++i) this.getNum()

      // Fetch Timestamp
      for (i = 0; i < 10; ++i) this.timestamp += this.getChar()

      // Release 2 beta and earlier versions do not have 3bv or Timestamp
    } else {
      this.bbbv = []
      this.timestamp = ''
      for (i = 0; i < resultStringSize - 3; ++i) this.getNum()
    }

    // Throw away the 2 bytes '# ' before 'Vienna...'
    this.getInt2()

    // Program is 18 bytes 'Vienna Minesweeper'
    for (i = 0; i < 18; ++i) this.program += this.getChar()

    // Throw away the ' - '
    this.getInt3()

    // Put remainder of version string into a new string
    for (i = 0; i < versionInfoSize - 22; ++i) this.version += this.getChar()

    // Home Edition 3.0H and Scoreganizer 3.0C and later have 1 extra byte (a period) before player name
    this.getNum()

    // Check next two bytes to see if player entered Name
    const numPlayerInfo = this.getInt2()

    // Fetch Player fields (name, nick, country, token) if they exist
    // These last 3 fields were defined in Viennasweeper 3.1 RC1
    if (numPlayerInfo > 0) {
      nameLength = this.getNum()
      for (i = 0; i < nameLength; ++i) this.name[i] = this.getNum()
    }
    if (numPlayerInfo > 1) {
      nickLength = this.getNum()
      for (i = 0; i < nickLength; ++i) this.nick[i] = this.getNum()
    }
    if (numPlayerInfo > 2) {
      countryLength = this.getNum()
      for (i = 0; i < countryLength; ++i) this.country[i] = this.getNum()
    }
    if (numPlayerInfo > 3) {
      tokenLength = this.getNum()
      for (i = 0; i < tokenLength; ++i) this.token[i] = this.getNum()
    }

    // Throw away next 4 bytes
    this.getInt()

    // Get board size and Mine details
    this.w = this.getNum() // Next byte is w so 8, 9 or 1E
    this.h = this.getNum() // Next byte is h so 8, 9 or 10
    this.m = this.getInt2() // Next two bytes are number of mines

    // Fetch board layout and put in memory
    this.board = new Array(this.w * this.h).fill(0)

    // Every 2 bytes is x,y with 0,0 being the top left corner
    for (i = 0; i < this.m; ++i) {
      c = this.getNum()
      d = this.getNum()
      if (c > this.w || d > this.h) this.error('Invalid mine position')
      this.board[d * this.w + c] = 1
    }

    // Check number of flags placed before game started
    if (preflagsSize) {
      numPreflags = this.getInt2()
      for (i = 0; i < numPreflags; ++i) {
        c = this.getNum()
        d = this.getNum()

        this.video[cur++] = { event: 4, time: 0, x: this.squareSize / 2 + c * this.squareSize, y: this.squareSize / 2 + d * this.squareSize }
        this.video[cur++] = { event: 5, time: 0, x: this.squareSize / 2 + c * this.squareSize, y: this.squareSize / 2 + d * this.squareSize }
      }
    }

    // Fetch game properties
    this.qm = this.getNum() // Value 1 if Questionmarks used, otherwise 0
    this.nf = this.getNum() // Value 1 if no Flags were used, otherwise 0
    this.mode = this.getNum() // Value 0 for Classic, 1 UPK, 2 Cheat, 3 Density
    this.level = this.getNum() // Value 0 for Beg, 1 Int, 2 Exp, 3 Custom

    // Throw away rest of properties
    for (i = 4; i < propertiesSize; ++i) this.getNum()

    // Each iteration reads one event
    while (1) {
      this.video[cur] = <Event>{}
      this.video[cur].event = c = this.getNum()
      ++i

      // Get next 4 bytes containing time of event
      if (!c) {
        this.getInt()
        i += 4
        // Get mouse event (3 bytes time, 1 wasted, 2 width, 2 height)
      } else if (c <= 7) {
        i += 8
        this.video[cur].time = this.getInt3()
        this.getNum()
        this.video[cur].x = this.getInt2() - 12
        this.video[cur].y = this.getInt2() - 56
        cur++

        // Viennasweeper does not record clicks before timer starts
        // LR starts timer so the first LC is missed in the this.video file
        // This code generates the missing LC in that case
        // In other cases it generates a ghost event thus event[0] is empty
        if (isFirstEvent) {
          // Global variable set to 1 so on first iteration it becomes 0
          isFirstEvent = 0
          // Clone first recorded event but set missing event to LC
          this.video[cur] = <Event>{}
          this.video[cur].event = this.video[cur - 1].event
          this.video[cur - 1].event = 2
          this.video[cur].time = this.video[cur - 1].time
          this.video[cur].x = this.video[cur - 1].x
          this.video[cur].y = this.video[cur - 1].y
          cur++
        }
      } else if (c === 8) this.error('Invalid event')
      // Get board event (ie, 'pressed' or 'number 3')
      else if (c <= 14 || (c >= 18 && c <= 27)) {
        i += 2
        this.video[cur].x = this.getNum() + 1
        this.video[cur].y = this.getNum() + 1
        cur++
        // Get game status (ie, 'won')
      } else if (c <= 17) {
        break
      } else {
        this.error('Invalid event')
      }
    }

    // Number of game events
    this.size = cur + 1

    return 1
  }
}
