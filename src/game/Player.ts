/*****************************************************************
 Original RAWVF2RAWVF program by Maksim Bashov 2013-07-29. The program notes warned
 "the following code is much more awful than you may expect".

 Program was modified by Zhou Ke (crazyks) 2014-04-18. This fixed 2 bugs in the valeq()
 function relating to incrementing a count. It also fixed a bug where the len variable
 was called while being defined so results were off by 1 byte.

 Modified by Damien Moore for a month ending 2020-02-09. Changes included:

 - Fixed bug where error check failed due to differences between Linux and Windows.
 - Fix bug with number events so cell co-ordinates always start from 1 instead of 0.
 - Fixed bug where check_win() printed to screen instead of selected output method.
 - Fixed bug where check_win() was not called after openings.
 - Fixed bug where qm was checked instead of !qm.
 - Removed claims_win variable as the updated Viennasweeper parser makes this redundant.
 - Renamed variables to remove confusion over hun and ths in score calculations.
 - Truncated decimals in various calculations instead of rounding.
 - Aligned event names to RAWVF version 5 standard and removed unused functionality.
 - Changed function order so now functions are logically grouped.
 - Added detailed comments throughout file.

 Modified by Enbin Hu (Flop) 2021-11-13. Rewriting with TypeScript.

 This is being released as Rawparser version 6.

 Program works for Minesweeper Clone, Minesweeper Arbiter, Minesweeper X and Viennasweeper
 in both legal and cheat modes.

 The standard legal moves are LC (left click), LR (left release), RC (right click), RR
 (right release), MC (middle press) and MR (middle press). Flags and Questionmarks are
 placed and removed with a RC. The timer starts after the first cell is opened. Cells
 open after a LC-LR sequence. A Chord is when you LC and RC (in any order) then LR and
 RR (at the same time or in that order) on an open cell. If the cell contains a number
 and touches the same number of flags additional cells touched are opened. The normal
 chording method is to flag (RC-RR) then chord (LC-RC-LR-RR) in two motions. You can also
 chord by holding SHIFT during a LC-LR. You can also chord with a MC-MR. A fourth method
 is to flag (RC) then slide onto a number to finish the chord (LC-LR-RR) in one motion
 known as a 1.5 Click.

 Arbiter 0.44 and earlier allow an illegal move known as a Rilian Click. This occurs when
 a chord is released on an unopened cell (instead of a number) and the LR occurs after the
 RR. In legal game play this is a failed chord and nothing happens but a Rilian Click will
 perform a left click and open the cell. When running this program use the -r option to
 process these correctly.

 Elmar Technique is possible in all official minesweeper versions. This occurs when the left
 mouse button is configured to left click on both press and release. The code in this program
 will process but not identify Elmar Technique (the variable must be set in the minesweeper
 program parser and passed to this program in the input file).

 Program also has code to process FreeSweeper cheat options such as Nono (where holding SHIFT
 and LC lets you flag multiple cells by dragging the mouse over the cells like in Nonosweeper),
 Superflag (where RC on a number will flag adjacent cells if their count is the same) and
 Superclick (where LC on a number does a chord). The code in this program does not change the
 value of these variables and depends on the underlying minesweeper program parser to include
 these variables in their output.

 *****************************************************************/

import { Video, VideoEvent } from '@/game/video'

// This defines cell attributes and sets 'board' as a pointer to 'cell'
// For example, calling board[i].mine calls the value of mine at that cell location
interface Cell {
  // Value 1 if cell is a mine
  mine: number
  // Value 1 if cell belongs to an opening
  opening: number
  // Value 1 if cell belongs to a second opening
  opening2: number
  // Value 1 if cell belongs to an island of numbers
  island: number
  // Value 1 if cell is a number
  number: number
  // See init_board() function these are used to identify cell neighbours
  rb: number
  re: number
  cb: number
  ce: number
  // Value 1 if cell has been opened
  opened: number
  // Value 1 for both when flagged but do_chord() function returns wastedFlag to 0
  flagged: number
  wastedFlag: number
  // Value 1 if cell has a Questionmark
  questioned: number
  // Variable used in ZiNi calculations to assess optimal flagging style strategy
  premium: number
}

export class Player {
  private readonly MAXLEN = 1000
  private readonly MAXOPS = 1000
  private readonly MAXISLS = 1000

  // Initiate global variables
  private readonly board: Cell[]
  private readonly w: number
  private readonly h: number
  private readonly m: number
  private readonly size: number
  private won = 0
  private noBoardEvents = 0
  private noZini = 0
  private noRilianClicks = 1
  private noCheckInfo = 0
  private bbbv = 0
  private openings = 0
  private islands = 0
  private zini = 0
  private gzini = 0
  private hzini = 0
  private lClicks = 0
  private rClicks = 0
  private dClicks = 0
  private clicks15 = 0
  private wastedLClicks = 0
  private wastedRClicks = 0
  private wastedDClicks = 0
  private wastedClicks15 = 0
  private rilianClicks = 0
  private flags = 0
  private wastedFlags = 0
  private unflags = 0
  private misflags = 0
  private misunflags = 0
  private distance = 0
  private solvedBbbv = 0
  private closedCells = 0
  private sizeOps: number[] = []
  private sizeIsls: number[] = []
  private solvedOps = 0
  private solvedIsls = 0
  private left = 0
  private right = 0
  private middle = 0
  private shiftLeft = 0
  private chorded = 0
  private onedotfive = 0
  private curX = 0
  private curY = 0
  private curPrecX = 0
  private curPrecY = 0
  private curTime = 0
  private endTime = 0
  private event = ''
  private qm = 0
  private elmar = 0
  private nono = 0
  private superclick = 0
  private superflag = 0

  constructor (video: Video) {
    this.w = video.getWidth()
    this.h = video.getHeight()
    this.m = video.getMines()
    // Get number of cells in the board
    this.board = Array.from(Array(this.size = this.w * this.h), () => <Cell>{})
    // Check which cells are mines and note them with the '*' symbol
    for (let i = 0; i < this.h; ++i) {
      for (let j = 0; j < this.w; ++j) this.board[j * this.h + i].mine = video.getBoard()[i * this.w + j]
    }
    // Call function to get number of Openings and Islands
    this.initBoard()
    // Call function to calculate 3bv
    this.calcBBBV()
    // Call function to calculate ZiNi
    if (!this.noZini) this.calcZini()
    // 模拟所有录像事件
    for (let i = 0; i < video.getEvents().length; i++) {
      this.performEvent(video.getEvents()[i])
    }
  }

  /**
   * 模拟录像事件
   */
  private performEvent (event: VideoEvent) {
    this.curTime = event.time
    switch (event.mouse) {
      // 优先判断是否是鼠标移动事件
      case 'mv':
        this.mouseMove(event.column, event.row, event.x, event.y)
        break
      case 'lc':
        this.leftPress(event.column, event.row, event.x, event.y)
        break
      case 'lr':
        this.leftClick(event.column, event.row, event.x, event.y)
        break
      case 'rc':
        this.rightPress(event.column, event.row)
        break
      case 'rr':
        this.rightClick(event.column, event.row)
        break
      case 'mc':
        this.middlePress(event.column, event.row)
        break
      case 'mr':
        this.middleClick(event.column, event.row)
        break
      case 'sc':
        this.leftPressWithShift(event.column, event.row, event.x, event.y)
        break
      case 'mt':
        this.qm = this.qm ? 0 : 1
        break
    }
  }

  /**
   * Function to print error messages
   */
  private error (msg: string) {
    throw new Error(`${this.constructor.name}Error - ${msg}`)
  }

  /**
   * Erase all information about cell states
   */
  private restartBoard () {
    let i
    this.closedCells = this.size
    for (i = 0; i < this.size; ++i) {
      this.board[i].opened = this.board[i].flagged = this.board[i].wastedFlag = this.board[i].questioned = 0
    }
  }

  /**
   * Function to count mines touching a cell
   */
  private getNumber (index: number): number {
    let rr, cc
    let res = 0
    // Check neighbourhood
    for (rr = this.board[index].rb; rr <= this.board[index].re; ++rr) {
      for (cc = this.board[index].cb; cc <= this.board[index].ce; ++cc) {
        // Increase count if cell is a mine
        res += this.board[cc * this.h + rr].mine
      }
    }
    return res
  }

  /**
   * Determine if cell belongs to 1 or 2 Openings and assign it to an Opening ID
   */
  private setOpeningBorder (opId: number, index: number) {
    if (!this.board[index].opening) {
      this.board[index].opening = opId
    } else if (this.board[index].opening !== opId) {
      this.board[index].opening2 = opId
    }
  }

  /**
   * Determine the size (number of cells) in the Opening
   */
  private processOpening (opId: number, index: number) {
    let rr, cc
    ++this.sizeOps[opId]
    this.board[index].opening = opId
    // Check neighbourhood
    for (rr = this.board[index].rb; rr <= this.board[index].re; ++rr) {
      for (cc = this.board[index].cb; cc <= this.board[index].ce; ++cc) {
        const i = cc * this.h + rr
        if (this.board[i].number && !this.board[i].mine) {
          if (this.board[i].opening !== opId && this.board[i].opening2 !== opId) ++this.sizeOps[opId]
          this.setOpeningBorder(opId, i)
        } else if (!this.board[i].opening && !this.board[i].mine) {
          this.processOpening(opId, i)
        }
      }
    }
  }

  /**
   * Determine the size (number of cells) in the Island
   */
  private processIsland (isId: number, index: number) {
    let rr, cc
    this.board[index].island = isId
    ++this.sizeIsls[isId]
    // Check neighbourhood
    for (rr = this.board[index].rb; rr <= this.board[index].re; ++rr) {
      for (cc = this.board[index].cb; cc <= this.board[index].ce; ++cc) {
        const i = cc * this.h + rr
        if (!this.board[i].island && !this.board[i].mine && !this.board[i].opening) {
          this.processIsland(isId, i)
        }
      }
    }
  }

  /**
   * Function to read board layout and count number of Openings and Islands
   */
  private initBoard () {
    let i
    let r, c
    this.openings = 0

    // Determine the neighbourhood for each cell
    for (r = 0; r < this.h; ++r) {
      for (c = 0; c < this.w; ++c) {
        const index = c * this.h + r
        this.board[index].rb = r ? r - 1 : r
        this.board[index].re = r === this.h - 1 ? r : r + 1
        this.board[index].cb = c ? c - 1 : c
        this.board[index].ce = c === this.w - 1 ? c : c + 1
      }
    }

    // Set initial premium for each cell (for ZiNi calculations)
    for (i = 0; i < this.size; ++i) {
      // Premium is used in ZiNi calculations
      // ZiNi attempts to determine the optimal flagging strategy
      // Premium tries to determine potential contribution of cell to optimal solve of game
      // The fewer clicks needed to perform a useful action (like a chord) the higher the premium
      // Mines have no premium
      // An opened cell is more useful than a closed cell
      // Each correct flag makes a number more useful
      // A higher number is less useful because more flags are required
      this.board[i].premium = -(this.board[i].number = this.getNumber(i)) - 2
    }

    for (i = 0; i < this.size; ++i) {
      if (!this.board[i].number && !this.board[i].opening) {
        if (++this.openings > this.MAXOPS) this.error('Too many openings')
        this.sizeOps[this.openings] = 0
        // Send to function to determine size of Opening
        this.processOpening(this.openings, i)
      }
    }

    for (i = 0; i < this.size; ++i) {
      if (!this.board[i].opening && !this.board[i].island && !this.board[i].mine) {
        if (++this.islands > this.MAXISLS) this.error('Too many islands')
        this.sizeIsls[this.islands] = 0
        // Send to function to determine size of Island
        this.processIsland(this.islands, i)
      }
    }
  }

  /**
   * Function used by both the calc_bbbv() and calc_zini() functions
   */
  private getAdj3bv (index: number) {
    let res = 0
    let rr, cc
    if (!this.board[index].number) return 1
    // Check neighbourhood
    for (rr = this.board[index].rb; rr <= this.board[index].re; ++rr) {
      for (cc = this.board[index].cb; cc <= this.board[index].ce; ++cc) {
        const i = cc * this.h + rr
        res += (!this.board[i].mine && !this.board[i].opening) ? 1 : 0
      }
    }
    // Number belongs to the edge of an opening
    if (this.board[index].opening) ++res
    // Number belongs to the edge of a second opening
    if (this.board[index].opening2) ++res
    // Return number (0-9)
    return res
  }

  /**
   * Function to calculate 3bv
   */
  private calcBBBV () {
    let i
    // Start by setting 3bv equal to the number of openings
    this.bbbv = this.openings
    for (i = 0; i < this.size; ++i) {
      // Increase 3bv count if it is a non-edge number
      if (!this.board[i].opening && !this.board[i].mine) ++this.bbbv
      this.board[i].premium += this.getAdj3bv(i)
    }
  }

  /**
   * Functions used only by the calc_zini() function
   */

  // Open cell
  private open (index: number) {
    let rr, cc
    this.board[index].opened = 1
    ++this.board[index].premium

    // Check cell is a number and not on the edge of an opening
    if (!this.board[index].opening) {
      for (rr = this.board[index].rb; rr <= this.board[index].re; ++rr) {
        for (cc = this.board[index].cb; cc <= this.board[index].ce; ++cc) {
          --this.board[cc * this.h + rr].premium
        }
      }
    }
    // Decrease count of unopened cells
    --this.closedCells
  }

  // Perform checks before opening cells
  private reveal (index: number) {
    // Do not open flagged or already open cells
    if (this.board[index].opened) return
    if (this.board[index].flagged) return

    // Open if cell is a non-zero number
    if (this.board[index].number) {
      this.open(index)
      // Cell is inside an opening (not a number on the edge)
    } else {
      const op = this.board[index].opening
      let i
      for (i = 0; i < this.size; ++i) {
        if (this.board[i].opening2 === op ||
          this.board[i].opening === op) {
          // Open all numbers on the edge of the opening
          if (!this.board[i].opened) this.open(i)
          // Reduce premium of neighbouring cells
          // Chording on neighbouring cells will no longer open this opening
          --this.board[i].premium
        }
      }
    }
  }

  // Click inside an opening (not on the edge)
  private hitOpenings () {
    let j
    for (j = 0; j < this.size; ++j) {
      if (!this.board[j].number && !this.board[j].opened) {
        this.click(j)
      }
    }
  }

  // Flags neighbouring mines
  private flagAround (index: number) {
    let rr, cc
    // Check neighbourhood
    for (rr = this.board[index].rb; rr <= this.board[index].re; ++rr) {
      for (cc = this.board[index].cb; cc <= this.board[index].ce; ++cc) {
        const i = cc * this.h + rr
        if (this.board[i].mine) this.flag(i)
      }
    }
  }

  // Flag
  private flag (index: number) {
    let rr, cc
    if (this.board[index].flagged) return
    ++this.zini
    this.board[index].flagged = 1
    // Check neighbourhood
    for (rr = this.board[index].rb; rr <= this.board[index].re; ++rr) {
      for (cc = this.board[index].cb; cc <= this.board[index].ce; ++cc) {
        // Increase premium of neighbouring cells
        // Placing a flag makes it 1 click more likely a chord can occur
        ++this.board[cc * this.h + rr].premium
      }
    }
  }

  // Chord
  private chord (index: number) {
    let rr, cc
    ++this.zini
    for (rr = this.board[index].rb; rr <= this.board[index].re; ++rr) {
      for (cc = this.board[index].cb; cc <= this.board[index].ce; ++cc) {
        this.reveal(cc * this.h + rr)
      }
    }
  }

  // Click
  private click (index: number) {
    this.reveal(index)
    ++this.zini
  }

  /**
   * Function to calculate ZiNi and HZiNi
   */
  private calcZini () {
    let i
    this.zini = 0
    this.restartBoard()

    // While non-mine cells remain unopened
    while (this.closedCells > this.m) {
      let maxp = -1
      let curi = -1
      for (i = 0; i < this.size; ++i) {
        if (this.board[i].premium > maxp && !this.board[i].mine) {
          maxp = this.board[i].premium
          curi = i
        }
      }

      // Premium has climbed into positive territory
      if (curi !== -1) {
        if (!this.board[curi].opened) this.click(curi)
        this.flagAround(curi)
        this.chord(curi)
      } else {
        for (i = 0; i < this.size; ++i) {
          if (!this.board[i].opened && !this.board[i].mine &&
            (!this.board[i].number || !this.board[i].opening)) {
            curi = i
            break
          }
        }
        this.click(curi)
      }
    }

    this.gzini = this.zini

    // Start calculating HZiNi
    for (i = 0; i < this.size; ++i) {
      this.board[i].premium = -(this.board[i].number) - 2 + this.getAdj3bv(i)
    }
    this.zini = 0
    this.restartBoard()
    this.hitOpenings()

    // While non-mine cells remain unopened
    while (this.closedCells > this.m) {
      let maxp = -1
      let curi = -1
      for (i = 0; i < this.size; ++i) {
        if (this.board[i].premium > maxp && !this.board[i].mine && this.board[i].opened) {
          maxp = this.board[i].premium
          curi = i
        }
      }

      // Premium has climbed into positive territory
      if (curi !== -1) {
        if (!this.board[curi].opened) this.click(curi)
        this.flagAround(curi)
        this.chord(curi)
      } else {
        for (i = 0; i < this.size; ++i) {
          if (!this.board[i].opened && !this.board[i].mine &&
            (!this.board[i].number || !this.board[i].opening)) {
            curi = i
            break
          }
        }
        this.click(curi)
      }
    }
    this.hzini = this.zini
    this.restartBoard()
  }

  /**
   * Function to check if mouse location is over the board
   */
  private isInsideBoard (x: number, y: number) {
    return x >= 0 && x < this.w && y >= 0 && y < this.h
  }

  /**
   * Functions to press cells
   */

  // Press cell
  private push (x: number, y: number) {
    if (this.noBoardEvents) return
    if (!this.board[x * this.h + y].opened && !this.board[x * this.h + y].flagged) {
      if (this.board[x * this.h + y].questioned) {
        // fprintf(output, 'Cell pressed (it is a Questionmark) %d %d\n', x + 1, y + 1)
      } else {
        // fprintf(output, 'Cell pressed %d %d\n', x + 1, y + 1)
      }
    }
  }

  // Check which cells to press
  private pushAround (x: number, y: number) {
    let i, j
    for (i = this.board[x * this.h + y].rb; i <= this.board[x * this.h + y].re; ++i) {
      for (j = this.board[x * this.h + y].cb; j <= this.board[x * this.h + y].ce; ++j) {
        this.push(j, i)
      }
    }
  }

  /**
   * Functions to unpress cells (this does not open them)
   */

  // Unpress cell
  private pop (x: number, y: number) {
    if (!this.board[x * this.h + y].opened && !this.board[x * this.h + y].flagged) {
      if (this.board[x * this.h + y].questioned) {
        // fprintf(output, 'Cell released (it is a Questionmark) %d %d\n', x + 1, y + 1)
      } else {
        // fprintf(output, 'Cell released %d %d\n', x + 1, y + 1)
      }
    }
  }

  // Check which cells to unpress
  private popAround (x: number, y: number) {
    let i, j
    for (i = this.board[x * this.h + y].rb; i <= this.board[x * this.h + y].re; ++i) {
      for (j = this.board[x * this.h + y].cb; j <= this.board[x * this.h + y].ce; ++j) {
        this.pop(j, i)
      }
    }
  }

  /**
   * Functions to check Win or Lose status
   */
  private win () {
    this.endTime = this.curTime
    this.won = 1
  }

  // Print Solved 3bv
  private checkWin () {
    // TODO 删除多余代码
    // //This fixes a rounding error. The 3f rounds to 3 decimal places.
    // //Using 10,000 rounds the 4th decimal place first before 3f is calculated.
    // //This has the desired effect of truncating to 3 decimals instead of rounding.
    // let fix;
    // float fixfloated;
    // fix=(int)(this.curTime)*10;
    // fixfloated=(float)fix/10000;
    // fprintf(stdout,"%.3f Solved 3BV: %d of %d\n",fixfloated,this.solvedBbbv,this.bbbv);
    if (this.bbbv === this.solvedBbbv) this.win()
  }

  private fail () {
    this.endTime = this.curTime
    this.won = 0
  }

  /**
   * Functions for opening cells
   */

  // Change cell status to open
  private show (x: number, y: number) {
    const index = x * this.h + y
    // fprintf(output,"Cell opened (Number %d) %d %d\n",this.board[index].number,x+1,y+1);
    this.board[index].opened = 1
    // Increment counters if cell belongs to an opening and if this iteration opens the last cell in that opening
    if (this.board[index].opening) {
      if (!(--this.sizeOps[this.board[index].opening])) {
        ++this.solvedOps
        ++this.solvedBbbv
      }
    }
    // Increment counters if cell belongs to another opening and this iteration opens last cell in that opening
    if (this.board[index].opening2) {
      if (!(--this.sizeOps[this.board[index].opening2])) {
        ++this.solvedOps
        ++this.solvedBbbv
      }
    }
  }

  // Check how many cells to change
  private showOpening (op: number) {
    let i
    let j
    let k = 0
    for (i = 0; i < this.w; ++i) {
      for (j = 0; j < this.h; ++j, ++k) {
        if (this.board[k].opening === op || this.board[k].opening2 === op) {
          if (!this.board[k].opened && !this.board[k].flagged) {
            this.show(i, j)
          }
        }
      }
    }
  }

  // Perform checks before changing cell status
  private doOpen (x: number, y: number) {
    // Lose if cell is a mine
    if (this.board[x * this.h + y].mine) {
      this.board[x * this.h + y].opened = 1
      // fprintf(output,"Cell opened (it is a Mine) %d %d\n",x+1,y+1);
      this.fail()
    } else {
      // Check cell is inside an opening (number zero)
      if (!this.board[x * this.h + y].number) {
        // Open correct number of cells
        this.showOpening(this.board[x * this.h + y].opening)
        this.checkWin()
      } else {
        // Open single cell because it is a non-zero number
        this.show(x, y)
        if (!this.board[x * this.h + y].opening) {
          ++this.solvedBbbv
          // Increment count of solved islands if this is last cell of the island to be opened
          if (!(--this.sizeIsls[this.board[x * this.h + y].island])) ++this.solvedIsls
          this.checkWin()
        }
      }
    }
  }

  /**
   * Functions to Flag, Mark and Chord
   */

  // Count number of adjacent flags
  private flagsAround (x: number, y: number) {
    let i
    let j
    let res = 0
    for (i = this.board[x * this.h + y].rb; i <= this.board[x * this.h + y].re; ++i) {
      for (j = this.board[x * this.h + y].cb; j <= this.board[x * this.h + y].ce; ++j) {
        if (this.board[j * this.h + i].flagged) ++res
      }
    }
    return res
  }

  // Chord
  private doChord (x: number, y: number, onedotfive: number) {
    let wasted = 1
    let i
    let j
    // Check cell is already open and number equals count of surrounding flags
    if (this.board[x * this.h + y].number === this.flagsAround(x, y) && this.board[x * this.h + y].opened) {
      // Check neighbourhood
      for (i = this.board[x * this.h + y].rb; i <= this.board[x * this.h + y].re; ++i) {
        for (j = this.board[x * this.h + y].cb; j <= this.board[x * this.h + y].ce; ++j) {
          // Lose game if cell is not flagged and is a mine
          if (this.board[j * this.h + i].mine && !this.board[j * this.h + i].flagged) {
            this.fail()
          }
        }
      }
      // Check neighbourhood
      for (i = this.board[x * this.h + y].rb; i <= this.board[x * this.h + y].re; ++i) {
        for (j = this.board[x * this.h + y].cb; j <= this.board[x * this.h + y].ce; ++j) {
          // Open cell if not flagged and not already open
          if (!this.board[j * this.h + i].opened && !this.board[j * this.h + i].flagged) {
            this.doOpen(j, i)
            wasted = 0
            // Chord was successful so flag was not wasted
          } else if (this.board[j * this.h + i].flagged && this.board[j * this.h + i].wastedFlag) {
            this.board[j * this.h + i].wastedFlag = 0
            --this.wastedFlags
          }
        }
      }
      // Chord has been wasted
      if (wasted) {
        ++this.wastedDClicks
        if (onedotfive) ++this.wastedClicks15
      }
    } else {
      // Unpress chorded cells without opening them
      this.popAround(x, y)
      ++this.wastedDClicks
      if (onedotfive) ++this.wastedClicks15
    }
  }

  // Flag
  private doSetFlag (x: number, y: number) {
    // Note that the wastedFlag value becomes 0 after successful chord() function
    this.board[x * this.h + y].flagged = this.board[x * this.h + y].wastedFlag = 1
    // fprintf(output,"Flag %d %d\n",x+1,y+1);
    ++this.flags
    ++this.wastedFlags
    // Increase misflag count because cell is not a mine
    if (!this.board[x * this.h + y].mine) ++this.misflags
  }

  // Questionmark
  private doQuestion (x: number, y: number) {
    this.board[x * this.h + y].questioned = 1
    // fprintf(output,"Questionmark %d %d\n",x+1,y+1);
  }

  // Remove Flag or Questionmark
  private doUnsetFlag (x: number, y: number) {
    this.board[x * this.h + y].flagged = this.board[x * this.h + y].questioned = 0
    // fprintf(output,"Flag removed %d %d\n",x+1,y+1);
    // Decrease flag count, increase unflag count
    --this.flags
    ++this.unflags
    // Increase misunflag count because cell is not a mine
    if (!this.board[x * this.h + y].mine) ++this.misunflags
  }

  // Part of 'superflag' cheat function (flags neighbouring mines)
  private doFlagAround (x: number, y: number) {
    let i, j
    // Check neighbourhood
    for (i = this.board[x * this.h + y].rb; i <= this.board[x * this.h + y].re; ++i) {
      for (j = this.board[x * this.h + y].cb; j <= this.board[x * this.h + y].ce; ++j) {
        if (!this.board[j * this.h + i].flagged && !this.board[j * this.h + i].opened) {
          this.doSetFlag(j, i)
        }
      }
    }
  }

  // Part of 'superflag' cheat function (counts unopened neighbours)
  private closedSqAround (x: number, y: number) {
    let i
    let j
    let res = 0
    // Check neighbourhood
    for (i = this.board[x * this.h + y].rb; i <= this.board[x * this.h + y].re; ++i) {
      for (j = this.board[x * this.h + y].cb; j <= this.board[x * this.h + y].ce; ++j) {
        if (!this.board[j * this.h + i].opened) ++res
      }
    }
    return res
  }

  /**
   * Functions for clicking and moving the mouse
   */

  // Left click
  private leftClick (x: number, y: number, precX: number, precY: number) {
    if (!this.left) return
    if (x !== this.curX || y !== this.curY) this.mouseMove(x, y, precX, precY)
    this.left = 0
    if (!this.isInsideBoard(x, y)) {
      this.chorded = 0
      return
    }
    // Chord
    if (this.right || this.shiftLeft || (this.superclick && this.board[x * this.h + y].opened)) {
      ++this.dClicks
      if (this.onedotfive) ++this.clicks15
      this.doChord(x, y, this.onedotfive)
      this.chorded = this.right
      this.shiftLeft = 0
      // Left click
    } else {
      // Rilian click
      if (this.chorded) {
        this.chorded = 0
        ++this.rilianClicks
        if (this.noRilianClicks) return
      }
      ++this.lClicks
      if (!this.board[x * this.h + y].opened && !this.board[x * this.h + y].flagged) this.doOpen(x, y)
      else ++this.wastedLClicks
      this.chorded = 0
    }
    this.curX = x
    this.curY = y
  }

  // Mouse movement
  private mouseMove (x: number, y: number, precX: number, precY: number) {
    if (this.isInsideBoard(x, y)) {
      if ((this.left && this.right) || this.middle || this.shiftLeft) {
        if (this.curX !== x || this.curY !== y) {
          this.popAround(this.curX, this.curY)
          this.pushAround(x, y)
        }
      } else if (this.superclick && this.left && this.board[this.curX * this.h + this.curY].opened) {
        this.popAround(this.curX, this.curY)
        if (this.board[x * this.h + y].opened) {
          this.pushAround(x, y)
        } else {
          this.push(x, y)
        }
      } else if (this.left && !this.chorded) {
        if (this.curX !== x || this.curY !== y) {
          this.pop(this.curX, this.curY)
          this.push(x, y)
        }
        if (this.nono && (this.curX !== x || this.curY !== y)) {
          const sl = this.shiftLeft
          this.leftClick(x, y, this.curX, this.curY)
          this.left = 1
          this.shiftLeft = sl
        }
      }
    }
    // Distance is measured using Manhattan metric instead of Euclidean
    // Rationale is that pixels form a grid thus are not points
    this.distance += Math.abs(this.curPrecX - precX) + Math.abs(this.curPrecY - precY)
    this.curPrecX = precX
    this.curPrecY = precY

    if (this.isInsideBoard(x, y)) {
      this.curX = x
      this.curY = y
    }
  }

  // Left button down
  private leftPress (x: number, y: number, precX: number, precY: number) {
    if (this.middle) return
    this.left = 1
    this.shiftLeft = 0
    if (!this.isInsideBoard(x, y)) return
    if (!this.right && !(this.superclick && this.board[x * this.h + y].opened)) {
      this.push(x, y)
    } else {
      this.pushAround(x, y)
    }
    if (this.elmar || this.nono) {
      this.leftClick(x, y, precX, precY)
      this.left = 1
    }
    this.curX = x
    this.curY = y
  }

  // Chord using Shift during LC-LR
  private leftPressWithShift (x: number, y: number, precX: number, precY: number) {
    if (this.middle) return
    this.left = this.shiftLeft = 1
    if (!this.isInsideBoard(x, y)) return
    this.pushAround(x, y)
    if (this.elmar || this.nono) {
      this.leftClick(x, y, precX, precY)
      this.left = this.shiftLeft = 1
    }
    this.curX = x
    this.curY = y
  }

  // Right button down
  private rightPress (x: number, y: number) {
    if (this.middle) return
    this.right = 1
    this.shiftLeft = 0
    if (!this.isInsideBoard(x, y)) return
    if (this.left) {
      this.pushAround(x, y)
    } else {
      if (!this.board[x * this.h + y].opened) {
        this.onedotfive = 1
        this.chorded = 0
        if (this.board[x * this.h + y].flagged) {
          this.doUnsetFlag(x, y)
          if (!this.qm) this.doQuestion(x, y)
        } else {
          if (!this.qm || !this.board[x * this.h + y].questioned) {
            this.doSetFlag(x, y)
          } else {
            this.board[x * this.h + y].flagged = this.board[x * this.h + y].questioned = 0
            // fprintf(output,"Questionmark removed %d %d\n",x+1,y+1);
          }
        }
        ++this.rClicks
      } else if (this.superflag && this.board[x * this.h + y].opened) {
        if (this.board[x * this.h + y].number && this.board[x * this.h + y].number >= this.closedSqAround(x, y)) {
          this.doFlagAround(x, y)
        }
      }
    }
    this.curX = x
    this.curY = y
  }

  // Right button up
  private rightClick (x: number, y: number) {
    if (!this.right) return
    this.right = this.shiftLeft = 0
    if (!this.isInsideBoard(x, y)) {
      this.chorded = this.left
      this.onedotfive = 0
      return
    }
    // Chord
    if (this.left) {
      this.popAround(this.curX, this.curY)
      this.doChord(x, y, 0)
      ++this.dClicks
      this.chorded = 1
      // Click did not produce a Flag or Chord
    } else {
      // It was a RC not the beginning of a Chord
      if (!this.onedotfive && !this.chorded) {
        ++this.rClicks
        ++this.wastedRClicks
      }
      this.chorded = 0
    }
    this.onedotfive = 0
    this.curX = x
    this.curY = y
  }

  // Middle button down
  private middlePress (x: number, y: number) {
    // Middle button resets these boolean values
    this.shiftLeft = this.left = this.right = this.onedotfive = this.chorded = 0
    this.middle = 1
    if (!this.isInsideBoard(x, y)) return
    this.pushAround(x, y)
  }

  // Middle button up
  private middleClick (x: number, y: number) {
    if (!this.middle) return
    this.middle = 0
    if (!this.isInsideBoard(x, y)) return
    this.doChord(x, y, 0)
    ++this.dClicks
  }
}
