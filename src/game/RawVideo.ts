import { BaseVideo, VideoEvent } from '@/game/BaseVideo'
import { times } from 'number-precision'

export class RawVideo extends BaseVideo {
  protected mName = 'RawVideo'
  protected mWidth = -1
  protected mHeight = -1
  protected mMines = -1
  protected mMarks = false
  protected mBoard: number[] = []
  protected mEvents: VideoEvent[] = []
  protected mPlayer: Uint8Array = new Uint8Array()

  constructor (data: ArrayBuffer) {
    super(data)
    this.readOptions()
    this.readBoard()
    this.readEvents()
  }

  /**
   * 读取录像选项
   */
  private readOptions () {
    // 读取基本参数
    const textDecoder = new TextDecoder()
    while (true) {
      const lineArr = this.getLine()
      if (lineArr == null) {
        this.error('No board')
        return
      }
      const lineStr = textDecoder.decode(lineArr).toLowerCase().trim()
      const index = lineStr.indexOf(':')
      // 如果当前行没有 ':' 字符或者 ':' 的位置在首字符，则直接读取下一行
      if (index <= 0) continue
      const option = lineStr.substring(0, index)
      const value = lineStr.substring(index + 1).trim()
      if (option === 'player') {
        this.mPlayer = lineArr.slice(index + 1)
      } else if (option === 'width') {
        this.mWidth = Number(value)
        if (!Number.isInteger(this.mWidth) || this.mWidth <= 0) this.error(`Invalid board width: "${value}"`)
      } else if (option === 'height') {
        this.mHeight = Number(value)
        if (!Number.isInteger(this.mHeight) || this.mHeight <= 0) this.error(`Invalid board height: "${value}"`)
      } else if (option === 'mines') {
        this.mMines = Number(value)
        // 雷数可以为 0
        if (!Number.isInteger(this.mMines) || this.mMines < 0) this.error(`Invalid number of mines: "${value}"`)
        // QuestionMarks 是为了兼容部分旧版本录像，如：FreeSweeper release 10 保存的录像
      } else if (option === 'marks' || option === 'QuestionMarks'.toLowerCase()) {
        if (value !== 'on' && value !== 'off') this.error(`Invalid question marks: "${value}"`)
        this.mMarks = value === 'on'
      } else if (option === 'level') {
        // Marathon is a Viennasweeper mode used in some tournaments
        if (value === 'marathon') this.error('This program doesn\'t support marathon RawVF')
      } else if (option === 'mode') {
        // 不支持作弊模式，作弊模式下有很多额外的可选项，如：Lives、Autoflag、Lawnmower、ElmarTechnique、NonoMouse、SuperClick、SuperFlag
        if (value === 'cheat') this.error('This program doesn\'t support cheat RawVF')
      } else if (option === 'board') {
        break
      }
    }
    // 检查是否有必要参数
    if (this.mWidth < 0) this.error('No width')
    if (this.mHeight < 0) this.error('No height')
    if (this.mMines < 0) this.error('No mines')
  }

  /**
   * 读取录像布局
   */
  private readBoard () {
    for (let i = 0; i < this.mHeight; i++) {
      const line = this.getLine()
      if (line === null) {
        this.error('Unexpected end of board')
        return
      }
      for (let j = 0; j < this.mWidth; j++) {
        // '*'.charCodeAt(0) = 42
        this.mBoard[i * this.mWidth + j] = line[j] === 42 ? 1 : 0
      }
    }
  }

  /**
   * 读取录像事件
   */
  private readEvents () {
    const textDecoder = new TextDecoder()
    // 待处理字符串
    let str = ''
    // 以指定字符作为分隔符获取下一个子字符串，并丢弃已处理的字符串
    const getNext = (split: string): string => {
      const index = str.indexOf(split)
      // 如果字符串不包含指定分隔符，则丢弃所有字符
      if (index === -1) return (str = '')
      // 获取符合条件的子字符串
      const value = str.slice(0, index)
      // 丢弃已处理的字符串
      str = str.slice(index + 1).trim()
      return value
    }
    // 循环读取录像事件
    while (true) {
      const lineArr = this.getLine()
      if (lineArr === null) break
      const lineStr = textDecoder.decode(lineArr).trim()
      // 如果首字符不是数字或者负号，则认为不是鼠标事件
      if (!this.isDigit(lineStr[0]) && lineStr[0] !== '-') continue
      str = lineStr
      const event = <VideoEvent>{}
      // 事件时间是小数格式，需要进行精确运算，否则可能会出现精度问题，如：1.001 * 1000 === 1000.9999999999999
      event.time = times(Number(getNext(' ')), 1000)
      // 获取事件名称
      const e = getNext(' ')
      // 判断鼠标事件
      if (e === 'lc' || e === 'lr' || e === 'rc' || e === 'rr' || e === 'mc' || e === 'mr' || e === 'mv' || e === 'sc' || e === 'mt') {
        event.mouse = e
      }
      // 鼠标事件获取完成后，直接将字符串截取到 '(' 所在的位置，因为可能没有记录 column 和 row 的数据，直接跳过，后面统一通过重新计算的方式获取
      str = str.indexOf('(') !== -1 ? str.slice(str.indexOf('(') + 1).trim() : ''
      // 如果后续没有待处理字符，则认为当前行记录的是其他事件，如：游戏事件（start、boom、won、nonstandard）、滚动事件（sx、sy）
      if (str.length === 0) continue
      // 获取 X 轴精确坐标
      event.x = Number(getNext(' '))
      // 获取 Y 轴精确坐标
      event.y = Number(getNext(')'))
      // 判断录像事件是否成功获取，其中事件时间是整数（单位：毫秒）；X 坐标和 Y 坐标可以超出游戏区域，如：-1
      if (!Number.isInteger(event.time) || event.mouse === undefined || !Number.isInteger(event.x) || !Number.isInteger(event.y)) {
        this.error(`Invalid mouse event: "${lineStr}"`)
      }
      // 计算得到当前列
      event.column = Math.floor(event.x / 16)
      // 计算得到当前行
      event.row = Math.floor(event.y / 16)
      this.mEvents.push(event)
    }
  }
}
