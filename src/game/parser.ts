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

// TODO 重新启用 ESLint 规则
/* eslint-disable @typescript-eslint/no-unused-vars */

const MAXLEN = 1000
const MAXOPS = 1000
const MAXISLS = 1000

let board: Cell[]

let w: number, h: number, m: number, size: number
let won: number
let noBoardEvents: number, noZini: number, noRilianClicks: number, noCheckInfo: number
let bbbv: number, openings: number, islands: number, zini: number, gzini: number, hzini: number
let leftClicks: number, rightClicks: number, doubleClicks: number, clicks15: number
let wastedLeftClicks: number, wastedRightClicks: number, wastedDoubleClicks: number, wastedoubleClicks15: number
let rilianClicks: number
let flags: number, wastedFlags: number, unFlags: number, misFlags: number, misUnFlags: number
let distance: number
let solvedBbbv: number
let closedCells: number
let sizeOps: number[]
let sizeIsls: number[]
let solvedOps: number, solvedIsls: number
let left: number, right: number, middle: number, shiftLeft: number
let chorded: number, oneDotFive: number
let curX: number, curY: number, curPrecX: number, curPrecY: number
let curTime: number, endTime: number
// char event[MAXLEN]
let qm: number
let elmar: number, nono: number, superClick: number, superFlag: number

function init () {
  board = []

  w = h = m = size = 0
  won = 0
  noBoardEvents = noZini = noRilianClicks = noCheckInfo = 0
  bbbv = openings = islands = zini = gzini = hzini = 0
  leftClicks = rightClicks = doubleClicks = clicks15 = 0
  wastedLeftClicks = wastedRightClicks = wastedDoubleClicks = wastedoubleClicks15 = 0
  rilianClicks = 0
  flags = wastedFlags = unFlags = misFlags = misUnFlags = 0
  distance = 0
  solvedBbbv = 0
  closedCells = 0
  sizeOps = new Array(MAXOPS)
  sizeIsls = new Array(MAXISLS)
  solvedOps = solvedIsls = 0
  left = right = middle = shiftLeft = 0
  chorded = oneDotFive = 0
  curX = curY = curPrecX = curPrecY = 0
  curTime = endTime = 0
  // char event[MAXLEN]
  qm = 0
  elmar = nono = superClick = superFlag = 0
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

  // Open if cell is a non-zero number
  if (board[index].number) {
    open(index)

    // Cell is inside an opening (not a number on the edge)
  } else {
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
function doChord (x: number, y: number, oneDotFive: number): void {
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
        // Open cell if not flagged and not already open
        if (!board[j * h + i].opened && !board[j * h + i].flagged) {
          doOpen(j, i)
          wasted = 0

          // Chord was successful so flag was not wasted
        } else if (board[j * h + i].flagged && board[j * h + i].wastedFlag) {
          board[j * h + i].wastedFlag = 0
          --wastedFlags
        }
      }
    }
    // Chord has been wasted
    if (wasted) {
      ++wastedDoubleClicks
      if (oneDotFive) ++wastedoubleClicks15
    }
  } else {
    // Unpress chorded cells without opening them
    popAround(x, y)
    ++wastedDoubleClicks
    if (oneDotFive) ++wastedoubleClicks15
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

// Part of 'superFlag' cheat function (flags neighbouring mines)
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

// Part of 'superFlag' cheat function (counts unopened neighbours)
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

// ==============================================================================================
// Functions for clicking and moving the mouse
// ==============================================================================================

// Left click
function leftClick (x: number, y: number, precX: number, precY: number): void {
  if (!left) return
  if (x !== curX || y !== curY) mouseMove(x, y, precX, precY)
  left = 0
  if (!isInsideBoard(x, y)) {
    chorded = 0
    return
  }
  // Chord
  if (right || shiftLeft || (superClick && board[x * h + y].opened)) {
    ++doubleClicks
    if (oneDotFive) ++clicks15
    doChord(x, y, oneDotFive)
    chorded = right
    shiftLeft = 0

    // Left click
  } else {
    // Rilian click
    if (chorded) {
      chorded = 0
      ++rilianClicks
      if (noRilianClicks) return
    }
    ++leftClicks
    if (!board[x * h + y].opened && !board[x * h + y].flagged) doOpen(x, y); else ++wastedLeftClicks
    chorded = 0
  }
  curX = x
  curY = y
}

// Mouse movement
function mouseMove (x: number, y: number, precX: number, precY: number): void {
  if (isInsideBoard(x, y)) {
    if ((left && right) || middle || shiftLeft) {
      if (curX !== x || curY !== y) {
        popAround(curX, curY)
        pushAround(x, y)
      }
    } else if (superClick && left && board[curX * h + curY].opened) {
      popAround(curX, curY)
      if (board[x * h + y].opened) {
        pushAround(x, y)
      } else {
        push(x, y)
      }
    } else if (left && !chorded) {
      if (curX !== x || curY !== y) {
        pop(curX, curY)
        push(x, y)
      }
      if (nono && (curX !== x || curY !== y)) {
        const sl = shiftLeft
        leftClick(x, y, curX, curY)
        left = 1
        shiftLeft = sl
      }
    }
  }
  // Distance is measured using Manhattan metric instead of Euclidean
  // Rationale is that pixels form a grid thus are not points
  distance += Math.abs(curPrecX - precX) + Math.abs(curPrecY - precY)
  curPrecX = precX
  curPrecY = precY

  if (isInsideBoard(x, y)) {
    curX = x
    curY = y
  }
}

// Left button down
function leftPress (x: number, y: number, precX: number, precY: number): void {
  if (middle) return
  left = 1
  shiftLeft = 0
  if (!isInsideBoard(x, y)) return
  if (!right && !(superClick && board[x * h + y].opened)) {
    push(x, y)
  } else {
    pushAround(x, y)
  }
  if (elmar || nono) {
    leftClick(x, y, precX, precY)
    left = 1
  }
  curX = x
  curY = y
}

// Chord using Shift during LC-LR
function leftPressWithShift (x: number, y: number, precX: number, precY: number): void {
  if (middle) return
  left = shiftLeft = 1
  if (!isInsideBoard(x, y)) return
  pushAround(x, y)
  if (elmar || nono) {
    leftClick(x, y, precX, precY)
    left = shiftLeft = 1
  }
  curX = x
  curY = y
}

// Toggle question mark setting
function toggleQuestionMarkSetting (x: number, y: number, precX: number, precY: number): void {
  qm = qm === 0 ? 1 : 0
}

// Right button down
function rightPress (x: number, y: number, precX: number, precY: number): void {
  if (middle) return
  right = 1
  shiftLeft = 0
  if (!isInsideBoard(x, y)) return
  if (left) {
    pushAround(x, y)
  } else {
    if (!board[x * h + y].opened) {
      oneDotFive = 1
      chorded = 0
      if (board[x * h + y].flagged) {
        doUnsetFlag(x, y)
        if (!qm) doQuestion(x, y)
      } else {
        if (!qm || !board[x * h + y].questioned) {
          doSetFlag(x, y)
        } else {
          board[x * h + y].flagged = board[x * h + y].questioned = 0
          fprintf('Questionmark removed %d %d\n', x + 1, y + 1)
        }
      }
      ++rightClicks
    } else if (superFlag && board[x * h + y].opened) {
      if (board[x * h + y].number && board[x * h + y].number >= closedSqAround(x, y)) {
        doFlagAround(x, y)
      }
    }
  }
  curX = x
  curY = y
}

// Right button up
function rightClick (x: number, y: number, precX: number, precY: number): void {
  if (!right) return
  right = shiftLeft = 0
  if (!isInsideBoard(x, y)) {
    chorded = left
    oneDotFive = 0
    return
  }
  // Chord
  if (left) {
    popAround(curX, curY)
    doChord(x, y, 0)
    ++doubleClicks
    chorded = 1

    // Click did not produce a Flag or Chord
  } else {
    // It was a RC not the beginning of a Chord
    if (!oneDotFive && !chorded) {
      ++rightClicks
      ++wastedRightClicks
    }
    chorded = 0
  }
  oneDotFive = 0
  curX = x
  curY = y
}

// Middle button down
function middlePress (x: number, y: number, precX: number, precY: number): void {
  // Middle button resets these boolean values
  shiftLeft = left = right = oneDotFive = chorded = 0
  middle = 1
  if (!isInsideBoard(x, y)) return
  pushAround(x, y)
}

// Middle button up
function middleClick (x: number, y: number, precX: number, precY: number): void {
  if (!middle) return
  middle = 0
  if (!isInsideBoard(x, y)) return
  doChord(x, y, 0)
  ++doubleClicks
}

// ==============================================================================================
// Function to convert string to double (decimal number with high precision)
// ==============================================================================================

// This is a custom function to mimic atoi but for decimals
function strToDouble (str: string): number {
  return parseFloat(str) || 0
}

export function parse (state: State, data: string): void {
  console.log(state)
  console.log(data)

  // Initialise local variables
  let i = 0
  const r = 0
  const c = 0
  const opts = 0
  const std = 0

  // TODO 处理不同的选项和开关

  // Create an array containing stats we wish to calculate
  const info = ['RAW_Time', 'RAW_3BV', 'RAW_Solved3BV', 'RAW_3BV/s', 'RAW_ZiNi', 'RAW_ZiNi/s', 'RAW_HZiNi', 'RAW_HZiNi/s',
    'RAW_Clicks', 'RAW_Clicks/s',
    'RAW_LeftClicks', 'RAW_LeftClicks/s', 'RAW_RightClicks', 'RAW_RightClicks/s',
    'RAW_DoubleClicks', 'RAW_DoubleClicks/s', 'RAW_WastedClicks', 'RAW_WastedClicks/s',
    'RAW_WastedLeftClicks', 'RAW_WastedLeftClicks/s',
    'RAW_WastedRightClicks', 'RAW_WastedRightClicks/s', 'RAW_WastedDoubleClicks',
    'RAW_WastedDoubleClicks/s', 'RAW_1.5Clicks', 'RAW_1.5Clicks/s',
    'RAW_IOE', 'RAW_Correctness', 'RAW_Throughput', 'RAW_ZNE', 'RAW_ZNT', 'RAW_HZNE', 'RAW_HZNT',
    'RAW_Openings', 'RAW_Islands',
    'RAW_Flags', 'RAW_WastedFlags', 'RAW_Unflags', 'RAW_Misflags', 'RAW_Misunflags',
    'RAW_RilianClicks', 'RAW_RilianClicks/s']

  // Initialise local variables
  // The size of char is 4 (32 bit) or 8 (64 bit) on Linux but is 4 in both cases for Windows
  // Either way this should return the count of items in the info[] array
  const numInfo = info.length
  const hasInfo: number[] = new Array(numInfo)
  const ptrInfo: number[] = new Array(numInfo)
  const infoI: number[] = new Array(numInfo)
  const infoD: number[] = new Array(numInfo)

  // Create array with default values for each stat in the info[] array
  const intInfo = [0, 1, 1, 0, 1, 0, 1, 0,
    1, 0,
    1, 0, 1, 0,
    1, 0, 1, 0,
    1, 0,
    1, 0, 1,
    0, 1, 0,
    0, 0, 0, 0, 0, 0, 0,
    1, 1,
    1, 1, 1, 1, 1,
    1, 0]

  // Set some local variables to default values
  const checkInfo: boolean[] = new Array(numInfo)
  const ww = 8
  const hh = 8
  const mm = 10
  const mCl = 1
  const noMode = 1
  const squareSize = 16
  const claimsWin = 0

  // Clear some arrays related to info[]
  for (i = 0; i < numInfo; ++i) hasInfo[i] = 0
  for (i = 0; i < numInfo; ++i) checkInfo[i] = 1 && !noZini

  // Clear some arrays related to board[]
  for (i = 0; i < MAXOPS; ++i) sizeOps[i] = 0
  for (i = 0; i < MAXISLS; ++i) sizeIsls[i] = 0

  // // Read the input file header and extract existing stats to output file (or screen)
  // while(1)
  // {
  //   let infoStr = 0
  //   long ptr=ftell(input)
  //
  //   // Read a line from input file and store in char event
  //   fgets(event,MAXLEN,input)
  //
  //   if(feof(input))
  //   {
  //     error('No board\n')
  //   }
  //
  //   // Stop extracting lines once input file header reaches the board layout
  //   if(opteq(event,'board')) break
  //   // Otherwise extract the game information
  //   else if(opteq(event,'width')) w=atoi(event+6)
  //   else if(opteq(event,'height')) h=atoi(event+7)
  //   else if(opteq(event,'mines')) m=atoi(event+6)
  //   else if(opteq(event,'marks')) qm=valeq(event+6,'on\n')
  //   else if(opteq(event,'level'))
  //   {
  //     const char* e=event+6
  //     // Marathon is a Viennasweeper mode used in some tournaments
  //     if(valeq(e,'Marathon'))
  //       error('This program doesn't support marathon RawVF')
  //     else if(valeq(e,'Beginner'))
  //     {
  //       ww=hh=8;mm=10
  //     }
  //     else if(valeq(e,'Intermediate'))
  //     {
  //       ww=hh=16;mm=40
  //     }
  //     else if(valeq(e,'Expert'))
  //     {
  //       ww=30;hh=16;mm=99
  //     }
  //   }
  //   else if(opteq(event,'Mode'))
  //   {
  //     noMode=0
  //     mCl=valeq(event+5,'Classic')
  //   }
  //   else
  //     // Print any other lines in the input file header
  //     for(i=0;i<numInfo;++i)
  //     {
  //       if(opteq(event,info[i]))
  //       {
  //         hasInfo[i]=1
  //         ptrInfo[i]=ptr+strlen(info[i])+1L
  //         infoStr=1
  //         break
  //       }
  //     }
  //   // Write event to the output file (or screen)
  //   fputs(event,output)
  // }
  //
  // // Get number of cells in the board
  // board=(cell*)malloc(sizeof(cell)*(size=w*h))
  //
  // // Writes stats and if no value prints blank value
  // for(i=0;i<numInfo;++i)
  //   if(!hasInfo[i])
  //   {
  //     fputs(info[i],output)
  //     ptrInfo[i]=ftell(output)+2L
  //     fputs(':           \n',output)
  //   }
  //
  // // Reset any knowledge of cells
  // clearboard()
  //
  // // Check which cells are mines and note them with the '*' symbol
  // for(r=0;r<h;++r)
  // {
  //   fgets(event,MAXLEN,input)
  //   for(c=0;c<w;++c) board[c*h+r].mine=event[c]=='*'
  //   // Write board with mines to the output file (or screen)
  //   fputs(event,output)
  // }
  //
  // // Call function to get number of Openings and Islands
  // init_board()
  //
  // // Call function to calculate 3bv
  // calc_bbbv()
  //
  // // Call function to calculate ZiNi
  // if(!noZini) calc_zini()
  //
  // // Initialise variables with default values
  // solved_bbbv=distance=l_clicks=r_clicks=d_clicks=wasted_l_clicks=wasted_r_clicks=wasted_d_clicks=
  //   clicks_15=wasted_clicks_15=flags=wasted_flags=unflags=misflags=misunflags=rilian_clicks=0
  // left=right=middle=shift_left=chorded=onedotfive=0
  //
  // // Write the game events
  // while(1)
  // {
  //   int board_event,len
  //   fgets(event,MAXLEN,input)
  //   if(feof(input)) break
  //
  //   len=strlen(event)
  //   // Closed, Flag, Questionmark, Pressed & Pressed Questionmark, Nonstandard
  //   board_event=len<=2 || event[0]=='c' || event[0]=='f' || event[0]=='q' || event[0]=='p' || event[0]=='n'
  //   if(!no_board_events && board_event) continue
  //
  //   // Write event to output file (or screen)
  //   fputs(event,output)
  //
  //   // Ignore certain board events
  //   if(board_event)
  //     continue
  //   // Start (implemented in Viennasweeper)
  //   else if(event[0]=='s')
  //     continue
  //   // Won (implemented in Viennasweeper)
  //   else if(event[0]=='w')
  //     claimsWin=1
  //   // Blast (implemented in Viennasweeper)
  //   else if(event[0]=='b' && event[1]=='l')
  //     continue
  //   // Boom (implemented in Freesweeper)
  //   else if(event[0]=='b' && event[1]=='o')
  //     continue
  //   // Nonstandard (proposed in RAW standard)
  //   else if(event[0]=='n' && event[1]=='o')
  //     continue
  //
  //   // Mouse events and the function to call in each case
  //   else if(isdigit(event[0]) || event[0]=='-')
  //   {
  //     int i=(event[0]=='-'?1:0)
  //     void (*func)(int,int,int,int)=0
  //     int x,y,neg_x,neg_y
  //
  //     // Get the time of the event
  //     cur_time=0
  //     while(event[i]!='.' && i<len) cur_time=cur_time*10+event[i++]-'0'
  //
  //     // Deal with seconds, tenths and hundredths
  //     cur_time=cur_time*1000+(event[i+1]-'0')*100+(event[i+2]-'0')*10
  //     // Include thousandths if available
  //     if(isdigit(event[i+3])) cur_time+=(event[i+3]-'0')
  //
  //     while(event[++i]!=' ' && i<len)
  //     while(event[++i]==' ' && i<len)
  //     if(event[0]=='-') cur_time=0
  //
  //     // Get the type of event
  //     if(i+1>=len) continue
  //
  //     // Left button
  //     if(event[i]=='l')
  //       if(event[i+1]=='r')
  //         func=left_click
  //       else if(event[i+1]=='c')
  //         func=left_press
  //       else
  //         error('Unknown event')
  //
  //     // Right button
  //     else if(event[i]=='r')
  //       if(event[i+1]=='r')
  //         func=right_click
  //       else if(event[i+1]=='c')
  //         func=right_press
  //       else
  //         error('Unknown event')
  //
  //     // Mouse movement and Middle button
  //     else if(event[i]=='m')
  //       if(event[i+1]=='v')
  //         func=mouse_move
  //       else if(event[i+1]=='r')
  //         func=middle_click
  //       else if(event[i+1]=='c')
  //         func=middle_press
  //       // Toggle question mark setting (implemented in MinesweeperX)
  //       else if(event[i+1]=='t')
  //         func=toggle_question_mark_setting
  //       else
  //         error('Unknown event')
  //
  //     // Start (implemented in Viennasweeper)
  //     else if(event[i]=='s')
  //       if(event[i+1]=='t')
  //         continue
  //       // Scrolling (proposed in RAW standard)
  //       else if(event[i+1]=='x' || event[i+1]=='y')
  //         continue
  //       // Shift chord (implemented in Arbiter & Freesweeper)
  //       else if(event[i+1]=='c')
  //         func=left_press_with_shift
  //       else
  //         error('Unknown event')
  //     // Won (implemented in Viennasweeper)
  //     else if(event[i]=='w')
  //       claimsWin=1
  //     // Blast (implemented in Viennasweeper)
  //     else if(event[i]=='b' && event[i+1]=='l')
  //       continue
  //     // Boom (implemented in Freesweeper)
  //     else if(event[i]=='b' && event[i+1]=='o')
  //       continue
  //     // Nonstandard (proposed in RAW standard)
  //     else if(event[i]=='n' && event[i+1]=='o')
  //       continue
  //     else
  //       error('Unknown event')
  //
  //     while(event[++i]!='(' && i<len)
  //     while(!isdigit(event[++i]) && i<len)
  //     neg_x=event[i-1]=='-'
  //     x=0
  //     while(isdigit(event[i]) && i<len) x=x*10+event[i++]-'0'
  //     while(!isdigit(event[++i]))
  //     if(neg_x) x=-x
  //     neg_y=event[i-1]=='-'
  //     y=0
  //     while(isdigit(event[i]) && i<len) y=y*10+event[i++]-'0'
  //     if(neg_y) y=-y
  //
  //     func(x/squareSize,y/squareSize,x,y)
  //   }
  // }
  //
  // // Set some local variables
  // if(!end_time) end_time=cur_time
  // i=0
  // int clicks=l_clicks+r_clicks+d_clicks
  // int w_clicks=wasted_l_clicks+wasted_r_clicks+wasted_d_clicks
  // int e_clicks=clicks-w_clicks
  // double coeff=(double)solved_bbbv/bbbv
  //
  // // Calculate all remaining stats
  // infoD[i++]=end_time/1000.0
  // infoI[i++]=bbbv
  // infoI[i++]=solved_bbbv
  // infoD[i++]=solved_bbbv/infoD[0]
  // infoI[i++]=gzini
  // infoD[i++]=gzini*solved_bbbv/(bbbv*infoD[0])
  // infoI[i++]=hzini
  // infoD[i++]=hzini*solved_bbbv/(bbbv*infoD[0])
  // infoI[i++]=clicks
  // infoD[i]=infoI[i-1]/infoD[0];++i
  // infoI[i++]=l_clicks
  // infoD[i]=infoI[i-1]/infoD[0];++i
  // infoI[i++]=r_clicks
  // infoD[i]=infoI[i-1]/infoD[0];++i
  // infoI[i++]=d_clicks
  // infoD[i]=infoI[i-1]/infoD[0];++i
  // infoI[i++]=w_clicks
  // infoD[i]=infoI[i-1]/infoD[0];++i
  // infoI[i++]=wasted_l_clicks
  // infoD[i]=infoI[i-1]/infoD[0];++i
  // infoI[i++]=wasted_r_clicks
  // infoD[i]=infoI[i-1]/infoD[0];++i
  // infoI[i++]=wasted_d_clicks
  // infoD[i]=infoI[i-1]/infoD[0];++i
  // infoI[i++]=clicks_15
  // infoD[i]=infoI[i-1]/infoD[0];++i
  // infoD[i++]=(double)solved_bbbv/clicks
  // infoD[i++]=(e_clicks)/(double)clicks
  // infoD[i++]=(double)solved_bbbv/e_clicks
  // infoD[i++]=(double)gzini*coeff/clicks
  // infoD[i++]=(double)gzini*coeff/e_clicks
  // infoD[i++]=(double)hzini*coeff/clicks
  // infoD[i++]=(double)hzini*coeff/e_clicks
  // infoI[i++]=openings
  // infoI[i++]=islands
  // infoI[i++]=flags
  // infoI[i++]=wasted_flags
  // infoI[i++]=unflags
  // infoI[i++]=misflags
  // infoI[i++]=misunflags
  // infoI[i++]=rilian_clicks
  // infoD[i]=infoI[i-1]/infoD[0];++i
  //
  // // If input file header is read and contains game Status perform the following check
  // if(!no_checkInfo && claimsWin && !won)
  //   fprintf(stderr,'File contains wrong info: it says the game was won while it was not\n')
  //
  // // Write generated stats
  // for(i=0;i<numInfo;++i)
  //   // Continue until an empty info[i] value is reached
  //   if(!checkInfo[i]) continue
  //   // If there is no input file header information
  //   else if(!hasInfo[i])
  //   {
  //     // This reads the output file starting from the first row of generated stats
  //     fseek(output,ptrInfo[i],SEEK_SET)
  //
  //     // Print key and value pair if integer
  //     if(intInfo[i])
  //     {
  //       fprintf(output,'%d',infoI[i])
  //     }
  //     // Print key and value pair if decimal
  //     else
  //     {
  //       // This fixes a rounding error. The 3f rounds to 3 decimal places.
  //       // Using 10,000 rounds the 4th decimal place first before 3f is calculated.
  //       // This has the desired effect of truncating to 3 decimals instead of rounding.
  //       int fix
  //       float fixfloated
  //       fix=(int)(infoD[i]*10000)
  //       fixfloated=(float)fix/10000
  //       fprintf(output,'%.3f',fixfloated)
  //     }
  //   }
  //   // If input file header did not exist or was intentionally not read perform error checks
  //   else if(!no_checkInfo)
  //   {
  //     int j;double d,dd
  //     fseek(input,ptrInfo[i],SEEK_SET)
  //     fgets(event,MAXLEN,input)
  //     if(intInfo[i] && (j=atoi(event))!=infoI[i])
  //       fprintf(stderr,'File contains wrong info:\n %s = %d while the file claims it's %d\n',
  //         info[i],infoI[i],j)
  //     else if(!intInfo[i] && (((dd=(d=strtodouble(event))-infoD[i]))>=0.001 || dd<=-0.001))
  //       fprintf(stderr,'File contains wrong info:\n %s = %.3f while the file claims it's %.3f\n',
  //         info[i],infoD[i],d)
  //   }
}
