/**
 * 游戏区域最小单元
 */
export class Cell {
  mine = false
  opening = false
  opening2 = false
  island = false
  number = false
  rb = false
  re = false
  cb = false
  ce = false
  opened = false
  flagged = false
  wastedFlag = false
  questioned = false
  premium = false

  constructor (mine: boolean) {
    this.mine = mine
  }
}

/**
 * 由若干个游戏最小单元组成的游戏棋盘
 */
export class GameBoard {
  private readonly height: number
  private readonly width: number
  private readonly cells: Cell[]

  constructor (width: number, height: number, board: string) {
    this.width = width
    this.height = height
    this.cells = Array(this.width * this.height)
    board.trim().split('').forEach((item, index) => {
      if (item === '0') {
        this.cells[index] = new Cell(false)
      } else if (item === '*') {
        this.cells[index] = new Cell(true)
      }
    })
  }

  /**
   * 获取宽度
   */
  public getWidth (): number {
    return this.width
  }

  /**
   * 获取高度
   */
  public getHeight (): number {
    return this.height
  }

  /**
   * 获取所有游戏最小单元
   */
  public getCells (): Cell[] {
    return this.cells
  }
}
