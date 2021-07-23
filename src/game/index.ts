/**
 * 游戏区域最小单元
 */
export class Cell {
  mine = 0
  opening = 0
  opening2 = 0
  island = 0
  number = 0
  rb = 0
  re = 0
  cb = 0
  ce = 0
  opened = 0
  flagged = 0
  wastedFlag = 0
  questioned = 0
  premium = 0

  constructor (mine: number) {
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
        this.cells[index] = new Cell(0)
      } else if (item === '*') {
        this.cells[index] = new Cell(1)
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
