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

 Modified by Enbin Hu (Flop) 2021-08-31. Rewriting with TypeScript.

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

import { Video } from '@/game/video'

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
  // Value 1 for both when flagged but do_chord() function returns wasted_flag to 0
  flagged: number
  wasted_flag: number
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
  private no_board_events = 0
  private no_zini = 0
  private no_rilian_clicks = 1
  private no_check_info = 0
  private bbbv = 0
  private openings = 0
  private islands = 0
  private zini = 0
  private gzini = 0
  private hzini = 0
  private l_clicks = 0
  private r_clicks = 0
  private d_clicks = 0
  private clicks_15 = 0
  private wasted_l_clicks = 0
  private wasted_r_clicks = 0
  private wasted_d_clicks = 0
  private wasted_clicks_15 = 0
  private rilian_clicks = 0
  private flags = 0
  private wasted_flags = 0
  private unflags = 0
  private misflags = 0
  private misunflags = 0
  private distance = 0
  private solved_bbbv = 0
  private closed_cells = 0
  private size_ops: number[] = []
  private size_isls: number[] = []
  private solved_ops = 0
  private solved_isls = 0
  private left = 0
  private right = 0
  private middle = 0
  private shift_left = 0
  private chorded = 0
  private onedotfive = 0
  private cur_x = 0
  private cur_y = 0
  private cur_prec_x = 0
  private cur_prec_y = 0
  private cur_time = 0
  private end_time = 0
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
    // Call function to get number of Openings and Islands
    this.initBoard()
    // Call function to calculate 3bv
    this.calcBBBV()
  }

  /**
   * Function to print error messages
   */
  private error (msg: string) {
    throw new Error(`${this.constructor.name}Error - ${msg}`)
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
  private set_opening_border (op_id: number, index: number) {
    if (!this.board[index].opening) {
      this.board[index].opening = op_id
    } else if (this.board[index].opening != op_id) {
      this.board[index].opening2 = op_id
    }
  }

  /**
   * Determine the size (number of cells) in the Opening
   */
  private process_opening (op_id: number, index: number) {
    let rr, cc
    ++this.size_ops[op_id]
    this.board[index].opening = op_id
    // Check neighbourhood
    for (rr = this.board[index].rb; rr <= this.board[index].re; ++rr) {
      for (cc = this.board[index].cb; cc <= this.board[index].ce; ++cc) {
        const i = cc * this.h + rr
        if (this.board[i].number && !this.board[i].mine) {
          if (this.board[i].opening != op_id && this.board[i].opening2 != op_id) ++this.size_ops[op_id]
          this.set_opening_border(op_id, i)
        } else if (!this.board[i].opening && !this.board[i].mine) {
          this.process_opening(op_id, i)
        }
      }
    }
  }

  /**
   * Determine the size (number of cells) in the Island
   */
  private process_island (is_id: number, index: number) {
    let rr, cc
    this.board[index].island = is_id
    ++this.size_isls[is_id]
    // Check neighbourhood
    for (rr = this.board[index].rb; rr <= this.board[index].re; ++rr) {
      for (cc = this.board[index].cb; cc <= this.board[index].ce; ++cc) {
        const i = cc * this.h + rr
        if (!this.board[i].island && !this.board[i].mine && !this.board[i].opening) {
          this.process_island(is_id, i)
        }
      }
    }
  }

  private initBoard () {
    let i
    let r, c
    this.openings = 0

    // Determine the neighbourhood for each cell
    for (r = 0; r < this.h; ++r) {
      for (c = 0; c < this.w; ++c) {
        const index = c * this.h + r
        this.board[index].rb = r ? r - 1 : r
        this.board[index].re = r == this.h - 1 ? r : r + 1
        this.board[index].cb = c ? c - 1 : c
        this.board[index].ce = c == this.w - 1 ? c : c + 1
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
        this.size_ops[this.openings] = 0
        // Send to function to determine size of Opening
        this.process_opening(this.openings, i)
      }
    }

    for (i = 0; i < this.size; ++i) {
      if (!this.board[i].opening && !this.board[i].island && !this.board[i].mine) {
        if (++this.islands > this.MAXISLS) this.error('Too many islands')
        this.size_isls[this.islands] = 0
        // Send to function to determine size of Island
        this.process_island(this.islands, i)
      }
    }
  }

  private calcBBBV () {
  }
}
