interface IBoard {
  getWidth (): number

  getHeight (): number
}

abstract class BaseBoard implements IBoard {
  private readonly height: number
  private readonly width: number

  constructor (width: number, height: number, board: string) {
    this.width = width
    this.height = height
    console.log(board)
  }

  public getWidth (): number {
    return this.width
  }

  public getHeight (): number {
    return this.height
  }
}

export class GameBoard extends BaseBoard {
}
