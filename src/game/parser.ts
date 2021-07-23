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

let board: Cell[]

let h: number
let size: number

let closedCells: number
let sizeOps: number[]

function init () {
  board = []
  h = 0
  size = 0
  closedCells = 0
  sizeOps = new Array(MAXOPS)
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

export function parse (state: State, data: string): void {
  console.log(state)
  console.log(data)
  console.log(opteq('Width: 8\n', 'width'))
  console.log(valeq(' beginner\n', 'Beginner'))
  clearBoard()
  restartBoard()
  console.log(getNumber)
  console.log(setOpeningBorder)
  console.log(processOpening)
  init()
}
