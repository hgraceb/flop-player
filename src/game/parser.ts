/*****************************************************************
 Original RAWVF2RAWVF program by Maksim Bashov 2013-07-29. The program notes warned
 "the following code is much more awful than you may expect".

 Program was modified by Zhou Ke (crazyks) 2014-04-18. This fixed 2 bugs in the valeq()
 function relating to incrementing a count. It also fixed a bug where the len variable
 was called while being defined so results were off by 1 byte.

 Modified by Damien Moore for a month ending 2020-02-09. Changes included:

 - Fixed bug where error check failed due to differences between Linux and Windows.
 - Fix bug with number events so cell co-ordinates always start from 1 instead of 0.
 - Fixed bug where check_win() prleted to screen instead of selected output method.
 - Fixed bug where check_win() was not called after openings.
 - Fixed bug where qm was checked instead of !qm.
 - Removed claims_win variable as the updated Viennasweeper parser makes this redundant.
 - Renamed variables to remove confusion over hun and ths in score calculations.
 - Truncated decimals in various calculations instead of rounding.
 - Aligned event names to RAWVF version 5 standard and removed unused functionality.
 - Changed function order so now functions are logically grouped.
 - Added detailed comments throughout file.

 Program was modified by Enbin Hu (Flop) 2021-06-13. Fix the bug of not handling the
 question mark setting toggle.

 Modified by Enbin Hu (Flop) for a month ending 2021-08-31. Rewriting with TypeScript.

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

import { State } from '@/store/state'
import { Cell } from '@/game/index'

const MAXOPS = 1000
const MAXISLS = 1000

let board: Cell[]

let w: number
let h: number
let m: number
let size: number

let won: number

let noBoardEvents: number

let bbbv: number
let openings: number
let islands: number
let zini: number
let gzini: number
let hzini: number

let wastedDoubleClicks: number
let wastedClicks15: number

let wastedFlags: number

let flags: number
let unFlags: number
let misFlags: number
let misUnFlags: number

let solvedBbbv: number
let closedCells: number
let sizeOps: number[]
let sizeIsls: number[]
let solvedOps: number
let solvedIsls: number

let curTime: number
let endTime: number

function init () {
  board = []

  w = 0
  h = 0
  m = 0
  size = 0

  won = 0

  noBoardEvents = 0

  bbbv = 0
  openings = 0
  islands = 0
  zini = 0
  gzini = 0
  hzini = 0

  wastedFlags = 0
  wastedClicks15 = 0

  wastedFlags = 0

  flags = 0
  unFlags = 0
  misFlags = 0
  misUnFlags = 0

  solvedBbbv = 0
  closedCells = 0
  sizeOps = new Array(MAXOPS)
  sizeIsls = new Array(MAXISLS)
  solvedOps = 0
  solvedIsls = 0

  curTime = 0
  endTime = 0
}

// TODO 将输出转换为具体的事件
// eslint-disable-next-line
function fprintf (...data: any[]): void {
  console.log(...data)
}

// ==============================================================================================
// Function to print error messages
// ==============================================================================================
function error (msg: string): void {
  throw new Error(msg)
}

// ==============================================================================================
// Functions to read key:value pairs from the input file header
// ==============================================================================================

// Read key (ie, 'Level')
function opteq (opt: string, str: string): boolean {
  let i = 0
  while (opt[i] !== ':' && opt[i] !== ' ' && opt[i] && str[i] && opt[i].toLowerCase() === str[i].toLowerCase()) {
    ++i
  }
  return opt[i] === ':' && i === str.length
}

// Read value (ie, 'Intermediate')
function valeq (val: string, str: string): boolean {
  let i = 0
  let j = 0
  while (val[i] === ' ') i++
  while (str[j] && val[i] !== '\n' && val[i] !== ' ' && val[i] && str[j].toLowerCase() === val[i].toLowerCase()) {
    ++i
    ++j
  }
  return (val[i] === '\n' || val[i] === ' ') && j === str.length
}

// ==============================================================================================
// Functions to erase board information
// ==============================================================================================

// Erase all information about cells
function clearBoard (): void {
  closedCells = size
  for (let i = 0; i < size; ++i) {
    board[i].mine = board[i].opened = board[i].flagged = board[i].questioned = board[i].wastedFlag =
      board[i].opening = board[i].opening2 = board[i].island = 0
  }
}

// Erase all information about cell states
function restartBoard (): void {
  closedCells = size
  for (let i = 0; i < size; ++i) {
    board[i].opened = board[i].flagged = board[i].wastedFlag = board[i].questioned = 0
  }
}

// ==============================================================================================
// Function to count mines touching a cell
// ==============================================================================================
function getNumber (index: number): number {
  let res = 0
  // Check neighbourhood
  for (let rr = board[index].rb; rr <= board[index].re; ++rr) {
    for (let cc = board[index].cb; cc <= board[index].ce; ++cc) {
      // Increase count if cell is a mine
      res += board[cc * h + rr].mine ? 1 : 0
    }
  }
  return res
}

// ==============================================================================================
// Functions used by init_board() to determine size of Openings and Islands
// ==============================================================================================

// Determine if cell belongs to 1 or 2 Openings and assign it to an Opening ID
function setOpeningBorder (opId: number, index: number): void {
  if (!board[index].opening) {
    board[index].opening = opId
  } else if (board[index].opening !== opId) {
    board[index].opening2 = opId
  }
}

// Determine the size (number of cells) in the Opening
function processOpening (opId: number, index: number): void {
  ++sizeOps[opId]
  board[index].opening = opId
  // Check neighbourhood
  for (let rr = board[index].rb; rr <= board[index].re; ++rr) {
    for (let cc = board[index].cb; cc <= board[index].ce; ++cc) {
      const i = cc * h + rr
      if (board[i].number && !board[i].mine) {
        if (board[i].opening !== opId && board[i].opening2 !== opId) {
          ++sizeOps[opId]
        }
        setOpeningBorder(opId, i)
      } else if (!board[i].opening && !board[i].mine) {
        processOpening(opId, i)
      }
    }
  }
}

// Determine the size (number of cells) in the Island
function processIsland (isId: number, index: number): void {
  board[index].island = isId
  ++sizeIsls[isId]
  // Check neighbourhood
  for (let rr = board[index].rb; rr <= board[index].re; ++rr) {
    for (let cc = board[index].cb; cc <= board[index].ce; ++cc) {
      const i = cc * h + rr
      if (!board[i].island && !board[i].mine && !board[i].opening) {
        processIsland(isId, i)
      }
    }
  }
}

// ==============================================================================================
// Function to read board layout and count number of Openings and Islands
// ==============================================================================================
function initBoard (): void {
  openings = 0

  // Determine the neighbourhood for each cell
  for (let r = 0; r < h; ++r) {
    for (let c = 0; c < w; ++c) {
      const index = c * h + r
      board[index].rb = r ? r - 1 : r
      board[index].re = r === h - 1 ? r : r + 1
      board[index].cb = c ? c - 1 : c
      board[index].ce = c === w - 1 ? c : c + 1
    }
  }

  // Set initial premium for each cell (for ZiNi calculations)
  for (let i = 0; i < size; ++i) {
    // Premium is used in ZiNi calculations
    // ZiNi attempts to determine the optimal flagging strategy
    // Premium tries to determine potential contribution of cell to optimal solve of game
    // The fewer clicks needed to perform a useful action (like a chord) the higher the premium
    // Mines have no premium
    // An opened cell is more useful than a closed cell
    // Each correct flag makes a number more useful
    // A higher number is less useful because more flags are required
    board[i].premium = -(board[i].number = getNumber(i)) - 2
  }

  for (let i = 0; i < size; ++i) {
    if (!board[i].number && !board[i].opening) {
      if (++openings > MAXOPS) error('Too many openings')
      sizeOps[openings] = 0
      // Send to function to determine size of Opening
      processOpening(openings, i)
    }
  }

  for (let i = 0; i < size; ++i) {
    if (!board[i].opening && !board[i].island && !board[i].mine) {
      if (++islands > MAXISLS) error('Too many islands')
      sizeIsls[islands] = 0
      // Send to function to determine size of Island
      processIsland(islands, i)
    }
  }
}

// ==============================================================================================
// Function used by both the calc_bbbv() and calc_zini() functions
// ==============================================================================================
function getAdj3bv (index: number): number {
  let res = 0
  if (!board[index].number) return 1
  // Check neighbourhood
  for (let rr = board[index].rb; rr <= board[index].re; ++rr) {
    for (let cc = board[index].cb; cc <= board[index].ce; ++cc) {
      const i = cc * h + rr
      res += (!board[i].mine && !board[i].opening) ? 1 : 0
    }
  }
  // Number belongs to the edge of an opening
  if (board[index].opening) ++res
  // Number belongs to the edge of a second opening
  if (board[index].opening2) ++res
  // Return number (0-9)
  return res
}

// ==============================================================================================
// Function to calculate 3bv
// ==============================================================================================
function calcBbbv (): void {
  // Start by setting 3bv equal to the number of openings
  bbbv = openings
  for (let i = 0; i < size; ++i) {
    // Increase 3bv count if it is a non-edge number
    if (!board[i].opening && !board[i].mine) ++bbbv
    board[i].premium += getAdj3bv(i)
  }
}

// ==============================================================================================
// Functions used only by the calc_zini() function
// ==============================================================================================

// Open cell
function open (index: number): void {
  board[index].opened = 1
  ++board[index].premium

  // Check cell is a number and not on the edge of an opening
  if (!board[index].opening) {
    for (let rr = board[index].rb; rr <= board[index].re; ++rr) {
      for (let cc = board[index].cb; cc <= board[index].ce; ++cc) {
        --board[cc * h + rr].premium
      }
    }
  }
  // Decrease count of unopened cells
  --closedCells
}

// Perform checks before opening cells
function reveal (index: number): void {
  // Do not open flagged or already open cells
  if (board[index].opened) return
  if (board[index].flagged) return

  if (board[index].number) {
    // Open if cell is a non-zero number
    open(index)
  } else {
    // Cell is inside an opening (not a number on the edge)
    const op = board[index].opening
    for (let i = 0; i < size; ++i) {
      if (board[i].opening2 === op || board[i].opening === op) {
        // Open all numbers on the edge of the opening
        if (!board[i].opened) open(i)
        // Reduce premium of neighbouring cells
        // Chording on neighbouring cells will no longer open this opening
        --board[i].premium
      }
    }
  }
}

// Flag
function flag (index: number): void {
  if (board[index].flagged) return
  ++zini
  board[index].flagged = 1
  // Check neighbourhood
  for (let rr = board[index].rb; rr <= board[index].re; ++rr) {
    for (let cc = board[index].cb; cc <= board[index].ce; ++cc) {
      // Increase premium of neighbouring cells
      // Placing a flag makes it 1 click more likely a chord can occur
      ++board[cc * h + rr].premium
    }
  }
}

// Chord
function chord (index: number): void {
  ++zini
  for (let rr = board[index].rb; rr <= board[index].re; ++rr) {
    for (let cc = board[index].cb; cc <= board[index].ce; ++cc) {
      reveal(cc * h + rr)
    }
  }
}

// Click
function click (index: number): void {
  reveal(index)
  ++zini
}

// Click inside an opening (not on the edge)
function hitOpenings (): void {
  for (let j = 0; j < size; ++j) {
    if (!board[j].number && !board[j].opened) {
      click(j)
    }
  }
}

// Flags neighbouring mines
function flagAround (index: number): void {
  // Check neighbourhood
  for (let rr = board[index].rb; rr <= board[index].re; ++rr) {
    for (let cc = board[index].cb; cc <= board[index].ce; ++cc) {
      const i = cc * h + rr
      if (board[i].mine) flag(i)
    }
  }
}

// ==============================================================================================
// Function to calculate ZiNi and HZiNi
// ==============================================================================================
function calcZini (): void {
  let i
  zini = 0
  restartBoard()

  // While non-mine cells remain unopened
  // TODO 优化循环语句，处理 ESLint 报错
  // eslint-disable-next-line no-unmodified-loop-condition
  while (closedCells > m) {
    let maxp = -1
    let curi = -1
    for (i = 0; i < size; ++i) {
      if (board[i].premium > maxp && !board[i].mine) {
        maxp = board[i].premium
        curi = i
      }
    }

    // Premium has climbed into positive territory
    if (curi !== -1) {
      if (!board[curi].opened) click(curi)
      flagAround(curi)
      chord(curi)
    } else {
      for (i = 0; i < size; ++i) {
        if (!board[i].opened && !board[i].mine &&
          (!board[i].number || !board[i].opening)) {
          curi = i
          break
        }
      }
      click(curi)
    }
  }

  gzini = zini

  // Start calculating HZiNi
  for (i = 0; i < size; ++i) {
    board[i].premium = -(board[i].number) - 2 + getAdj3bv(i)
  }
  zini = 0
  restartBoard()
  hitOpenings()

  // While non-mine cells remain unopened
  // TODO 优化循环语句，处理 ESLint 报错
  // eslint-disable-next-line no-unmodified-loop-condition
  while (closedCells > m) {
    let maxp = -1
    let curi = -1
    for (i = 0; i < size; ++i) {
      if (board[i].premium > maxp && !board[i].mine && board[i].opened) {
        maxp = board[i].premium
        curi = i
      }
    }

    // Premium has climbed into positive territory
    if (curi !== -1) {
      if (!board[curi].opened) click(curi)
      flagAround(curi)
      chord(curi)
    } else {
      for (i = 0; i < size; ++i) {
        if (!board[i].opened && !board[i].mine &&
          (!board[i].number || !board[i].opening)) {
          curi = i
          break
        }
      }
      click(curi)
    }
  }
  hzini = zini
  restartBoard()
}

// ==============================================================================================
// Function to check if mouse location is over the board
// ==============================================================================================
function isInsideBoard (x: number, y: number): boolean {
  return x >= 0 && x < w && y >= 0 && y < h
}

// ==============================================================================================
// Functions to press cells
// ==============================================================================================

// Press cell
function push (x: number, y: number): void {
  if (noBoardEvents) return
  if (!board[x * h + y].opened && !board[x * h + y].flagged) {
    if (board[x * h + y].questioned) {
      fprintf('Cell pressed (it is a Questionmark) %d %d\n', x + 1, y + 1)
    } else {
      fprintf('Cell pressed %d %d\n', x + 1, y + 1)
    }
  }
}

// Check which cells to press
function pushAround (x: number, y: number) {
  for (let i = board[x * h + y].rb; i <= board[x * h + y].re; ++i) {
    for (let j = board[x * h + y].cb; j <= board[x * h + y].ce; ++j) {
      push(j, i)
    }
  }
}

// ==============================================================================================
// Functions to unpress cells (this does not open them)
// ==============================================================================================

// Unpress cell
function pop (x: number, y: number) {
  if (!board[x * h + y].opened && !board[x * h + y].flagged) {
    if (board[x * h + y].questioned) {
      fprintf('Cell released (it is a Questionmark) %d %d\n', x + 1, y + 1)
    } else {
      fprintf('Cell released %d %d\n', x + 1, y + 1)
    }
  }
}

// Check which cells to unpress
function popAround (x: number, y: number) {
  for (let i = board[x * h + y].rb; i <= board[x * h + y].re; ++i) {
    for (let j = board[x * h + y].cb; j <= board[x * h + y].ce; ++j) {
      pop(j, i)
    }
  }
}

// ==============================================================================================
// Functions to check Win or Lose status
// ==============================================================================================
function win (): void {
  endTime = curTime
  won = 1
}

// Print Solved 3bv
function checkWin (): void {
  // This fixes a rounding error. The 3f rounds to 3 decimal places.
  // Using 10,000 rounds the 4th decimal place first before 3f is calculated.
  // This has the desired effect of truncating to 3 decimals instead of rounding.
  const fix = (curTime) * 10
  // TODO 处理为三位小数
  const fixFloated = fix / 10000

  fprintf('%.3f Solved 3BV: %d of %d\n', fixFloated, solvedBbbv, bbbv)
  if (bbbv === solvedBbbv) win()
}

function fail (): void {
  endTime = curTime
  won = 0
}

// ==============================================================================================
// Functions for opening cells
// ==============================================================================================

// Change cell status to open
function show (x: number, y: number): void {
  const index = x * h + y
  fprintf('Cell opened (Number %d) %d %d\n', board[index].number, x + 1, y + 1)
  board[index].opened = 1
  // Increment counters if cell belongs to an opening and if this iteration opens the last cell in that opening
  if (board[index].opening) {
    if (!(--sizeOps[board[index].opening])) {
      ++solvedOps
      ++solvedBbbv
    }
  }
  // Increment counters if cell belongs to another opening and this iteration opens last cell in that opening
  if (board[index].opening2) {
    if (!(--sizeOps[board[index].opening2])) {
      ++solvedOps
      ++solvedBbbv
    }
  }
}

// Check how many cells to change
function showOpening (op: number): void {
  let k = 0
  for (let i = 0; i < w; ++i) {
    for (let j = 0; j < h; ++j, ++k) {
      if (board[k].opening === op || board[k].opening2 === op) {
        if (!board[k].opened && !board[k].flagged) {
          show(i, j)
        }
      }
    }
  }
}

// Perform checks before changing cell status
function doOpen (x: number, y: number): void {
  // Lose if cell is a mine
  if (board[x * h + y].mine) {
    board[x * h + y].opened = 1
    fprintf('Cell opened (it is a Mine) %d %d\n', x + 1, y + 1)
    fail()
  } else {
    // Check cell is inside an opening (number zero)
    if (!board[x * h + y].number) {
      // Open correct number of cells
      showOpening(board[x * h + y].opening)
      checkWin()
    } else {
      // Open single cell because it is a non-zero number
      show(x, y)
      if (!board[x * h + y].opening) {
        ++solvedBbbv
        // Increment count of solved islands if this is last cell of the island to be opened
        if (!(--sizeIsls[board[x * h + y].island])) ++solvedIsls
        checkWin()
      }
    }
  }
}

// ==============================================================================================
// Functions to Flag, Mark and Chord
// ==============================================================================================

// Count number of adjacent flags
function flagsAround (x: number, y: number) {
  let res = 0
  for (let i = board[x * h + y].rb; i <= board[x * h + y].re; ++i) {
    for (let j = board[x * h + y].cb; j <= board[x * h + y].ce; ++j) {
      if (board[j * h + i].flagged) ++res
    }
  }
  return res
}

// Chord
function doChord (x: number, y: number, onedotfive: number): void {
  let wasted = 1
  let i, j
  // Check cell is already open and number equals count of surrounding flags
  if (board[x * h + y].number === flagsAround(x, y) && board[x * h + y].opened) {
    // Check neighbourhood
    for (i = board[x * h + y].rb; i <= board[x * h + y].re; ++i) {
      for (j = board[x * h + y].cb; j <= board[x * h + y].ce; ++j) {
        // Lose game if cell is not flagged and is a mine
        if (board[j * h + i].mine && !board[j * h + i].flagged) {
          fail()
        }
      }
    }
    // Check neighbourhood
    for (i = board[x * h + y].rb; i <= board[x * h + y].re; ++i) {
      for (j = board[x * h + y].cb; j <= board[x * h + y].ce; ++j) {
        if (!board[j * h + i].opened && !board[j * h + i].flagged) {
          // Open cell if not flagged and not already open
          doOpen(j, i)
          wasted = 0
        } else if (board[j * h + i].flagged && board[j * h + i].wastedFlag) {
          // Chord was successful so flag was not wasted
          board[j * h + i].wastedFlag = 0
          --wastedFlags
        }
      }
    }
    // Chord has been wasted
    if (wasted) {
      ++wastedDoubleClicks
      if (onedotfive) ++wastedClicks15
    }
  } else {
    // Unpress chorded cells without opening them
    popAround(x, y)
    ++wastedDoubleClicks
    if (onedotfive) ++wastedClicks15
  }
}

// Flag
function doSetFlag (x: number, y: number): void {
  // Note that the wastedFlag value becomes 0 after successful chord() function
  board[x * h + y].flagged = board[x * h + y].wastedFlag = 1
  fprintf('Flag %d %d\n', x + 1, y + 1)
  ++flags
  ++wastedFlags
  // Increase misflag count because cell is not a mine
  if (!board[x * h + y].mine) ++misFlags
}

// Questionmark
function doQuestion (x: number, y: number): void {
  board[x * h + y].questioned = 1
  fprintf('Questionmark %d %d\n', x + 1, y + 1)
}

// Remove Flag or Questionmark
function doUnsetFlag (x: number, y: number): void {
  board[x * h + y].flagged = board[x * h + y].questioned = 0
  fprintf('Flag removed %d %d\n', x + 1, y + 1)
  // Decrease flag count, increase unflag count
  --flags
  ++unFlags
  // Increase misunflag count because cell is not a mine
  if (!board[x * h + y].mine) ++misUnFlags
}

// Part of 'superflag' cheat function (flags neighbouring mines)
function doFlagAround (x: number, y: number): void {
  // Check neighbourhood
  for (let i = board[x * h + y].rb; i <= board[x * h + y].re; ++i) {
    for (let j = board[x * h + y].cb; j <= board[x * h + y].ce; ++j) {
      if (!board[j * h + i].flagged && !board[j * h + i].opened) {
        doSetFlag(j, i)
      }
    }
  }
}

// Part of 'superflag' cheat function (counts unopened neighbours)
function closedSqAround (x: number, y: number) {
  let res = 0
  // Check neighbourhood
  for (let i = board[x * h + y].rb; i <= board[x * h + y].re; ++i) {
    for (let j = board[x * h + y].cb; j <= board[x * h + y].ce; ++j) {
      if (!board[j * h + i].opened) ++res
    }
  }
  return res
}

// // ==============================================================================================
// // Functions for clicking and moving the mouse
// // ==============================================================================================
//
// // Function definition needed here because mouse_move() and left_click() reference each other
// function mouse_move(x : number,y : number,int prec_x,int prec_y); : void
//
// // Left click
// function left_click(x : number,y : number,int prec_x,int prec_y) : void
// {
//   if(!left) return
//   if(x!=cur_x || y!=cur_y) mouse_move(x,y,prec_x,prec_y)
//   left=0
//   if(!is_inside_board(x,y))
//   {
//     chorded=0
//     return
//   }
//   // Chord
//   if(right || shift_left || (superclick && board[x*h+y].opened))
//   {
//     ++d_clicks
//     if(onedotfive) ++clicks_15
//     doChord(x,y,onedotfive)
//     chorded=right
//     shift_left=0
//   }
//   // Left click
//   else
//   {
//     // Rilian click
//     if(chorded)
//     {
//       chorded=0
//       ++rilian_clicks
//       if(no_rilian_clicks) return
//     }
//     ++l_clicks
//     if(!board[x*h+y].opened && !board[x*h+y].flagged) doOpen(x,y); else ++wasted_l_clicks
//     chorded=0
//   }
//   cur_x=x;cur_y=y
// }
//
// // Mouse movement
// function mouse_move(x : number,y : number,int prec_x,int prec_y) : void
// {
//   if(is_inside_board(x,y))
//   {
//     if((left && right) || middle || shift_left)
//     {
//       if(cur_x!=x || cur_y!=y)
//       {
//         popAround(cur_x,cur_y)
//         push_around(x,y)
//       }
//     }
//     else if(superclick && left && board[cur_x*h+cur_y].opened)
//     {
//       popAround(cur_x,cur_y)
//       if(board[x*h+y].opened)
//         push_around(x,y)
//       else
//         push(x,y)
//     }
//     else if(left && !chorded)
//     {
//       if(cur_x!=x || cur_y!=y)
//       {
//         pop(cur_x,cur_y)
//         push(x,y)
//       }
//       if(nono && (cur_x!=x || cur_y!=y))
//       {
//         int sl=shift_left
//         left_click(x,y,cur_x,cur_y)
//         left=1
//         shift_left=sl
//       }
//     }
//   }
//   // Distance is measured using Manhattan metric instead of Euclidean
//   // Rationale is that pixels form a grid thus are not points
//   distance+=abs(cur_prec_x-prec_x)+abs(cur_prec_y-prec_y)
//   cur_prec_x=prec_x;cur_prec_y=prec_y
//
//   if(is_inside_board(x,y))
//   {
//     cur_x=x;cur_y=y
//   }
// }
//
// // Left button down
// function left_press(x : number,y : number,int prec_x,int prec_y) : void
// {
//   if(middle) return
//   left=1;shift_left=0
//   if(!is_inside_board(x,y)) return
//   if(!right && !(superclick && board[x*h+y].opened))
//     push(x,y)
//   else
//     push_around(x,y)
//   if(elmar || nono)
//   {
//     left_click(x,y,prec_x,prec_y)
//     left=1
//   }
//   cur_x=x;cur_y=y
// }
//
// // Chord using Shift during LC-LR
// function left_press_with_shift(x : number,y : number,int prec_x,int prec_y) : void
// {
//   if(middle) return
//   left=shift_left=1
//   if(!is_inside_board(x,y)) return
//   push_around(x,y)
//   if(elmar || nono)
//   {
//     left_click(x,y,prec_x,prec_y)
//     left=shift_left=1
//   }
//   cur_x=x;cur_y=y
// }
//
// // Toggle question mark setting
// function toggle_question_mark_setting(x : number,y : number,int prec_x,int prec_y) : void
// {
//   qm=!qm
// }
//
// // Right button down
// function right_press(x : number,y : number,int prec_x,int prec_y) : void
// {
//   if(middle) return
//   right=1;shift_left=0
//   if(!is_inside_board(x,y)) return
//   if(left)
//     push_around(x,y)
//   else
//   {
//     if(!board[x*h+y].opened)
//     {
//       onedotfive=1;chorded=0
//       if(board[x*h+y].flagged)
//       {
//         doUnsetFlag(x,y)
//         if(!qm) doQuestion(x,y)
//       }
//       else
//       {
//         if(!qm || !board[x*h+y].questioned)
//           doSetFlag(x,y)
//         else
//         {
//           board[x*h+y].flagged=board[x*h+y].questioned=0
//           fprintf('Questionmark removed %d %d\n',x+1,y+1)
//         }
//       }
//       ++r_clicks
//     }
//     else if(superflag && board[x*h+y].opened)
//     {
//       if(board[x*h+y].number && board[x*h+y].number>=closedSqAround(x,y))
//         doFlagAround(x,y)
//     }
//   }
//   cur_x=x;cur_y=y
// }
//
// // Right button up
// function right_click(x : number,y : number,int prec_x,int prec_y) : void
// {
//   if(!right) return
//   right=shift_left=0
//   if(!is_inside_board(x,y))
//   {
//     chorded=left
//     onedotfive=0
//     return
//   }
//   // Chord
//   if(left)
//   {
//     popAround(cur_x,cur_y)
//     doChord(x,y,0)
//     ++d_clicks
//     chorded=1
//   }
//   // Click did not produce a Flag or Chord
//   else
//   {
//     // It was a RC not the beginning of a Chord
//     if(!onedotfive && !chorded)
//     {
//       ++r_clicks
//       ++wasted_r_clicks
//     }
//     chorded=0
//   }
//   onedotfive=0
//   cur_x=x;cur_y=y
// }
//
// // Middle button down
// function middle_press(x : number,y : number,int prec_x,int prec_y) : void
// {
//   // Middle button resets these boolean values
//   shift_left=left=right=onedotfive=chorded=0
//   middle=1
//   if(!is_inside_board(x,y)) return
//   push_around(x,y)
// }
//
// // Middle button up
// function middle_click(x : number,y : number,int prec_x,int prec_y) : void
// {
//   if(!middle) return
//   middle=0
//   if(!is_inside_board(x,y)) return
//   doChord(x,y,0)
//   ++d_clicks
// }
//
//
//
// // ==============================================================================================
// // Function to convert string to double (decimal number with high precision)
// // ==============================================================================================
//
// // This is a custom function to mimic atoi but for decimals
// double strtodouble(const char* str)
// {
//   double res=0.0
//   int cur=-1,neg=0,len=strlen(str),hop=1
//   while(str[++cur]==' ')
//   if(!str[cur]) return 0.0
//   if(str[cur]=='-')
//   {
//     neg=1
//     ++cur
//   }
//   while(cur<len && isdigit(str[cur])) {res=res*10+str[cur++]-'0';}
//   if(str[cur++]!='.') return res
//   while(cur<len && isdigit(str[cur]))
//   {
//     res=res*10+str[cur++]-'0'
//     hop*=10
//   }
//   if(neg) res=-res
//   return res/hop
// }

export function parse (state: State, data: string): void {
  console.log(state)
  console.log(data)
  console.log(closedCells)
  console.log(bbbv)
  console.log(zini)
  console.log(gzini)
  console.log(hzini)
  console.log(endTime)
  console.log(curTime)
  console.log(solvedOps)
  console.log(solvedIsls)
  console.log(won)
  console.log(wastedFlags)
  console.log(wastedDoubleClicks)
  console.log(wastedClicks15)
  console.log(flags)
  console.log(unFlags)
  console.log(misFlags)
  console.log(misUnFlags)
  console.log(init.name)
  console.log(error.name)
  console.log(opteq('Width: 8\n', 'width'))
  console.log(valeq(' beginner\n', 'Beginner'))
  console.log(clearBoard.name)
  console.log(restartBoard.name)
  console.log(getNumber.name)
  console.log(setOpeningBorder.name)
  console.log(processOpening.name)
  console.log(initBoard.name)
  console.log(getAdj3bv.name)
  console.log(calcBbbv.name)
  console.log(open.name)
  console.log(reveal.name)
  console.log(chord.name)
  console.log(hitOpenings.name)
  console.log(flagAround.name)
  console.log(calcZini.name)
  console.log(isInsideBoard.name)
  console.log(push.name)
  console.log(pushAround.name)
  console.log(pop.name)
  console.log(popAround.name)
  console.log(win.name)
  console.log(checkWin.name)
  console.log(show.name)
  console.log(fail.name)
  console.log(showOpening.name)
  console.log(doOpen.name)
  console.log(doChord.name)
  console.log(doSetFlag.name)
  console.log(doQuestion.name)
  console.log(doUnsetFlag.name)
  console.log(doFlagAround.name)
  console.log(closedSqAround.name)
}
