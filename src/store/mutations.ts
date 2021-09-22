import { State } from './state'
import { parse } from '@/game/parser'
import { GameEvent } from '@/game'
import { store } from '@/store/index'
import { plus, times } from 'number-precision'
import { ImgCellType, ImgFaceType } from '@/util/image'
import { SCALE_ARRAY, SPEED_ARRAY, TIME_MAX } from '@/game/constants'

/**
 * Mutations 函数定义，使用类型推断的方式，可以快速找到函数的所有 Usages
 */
export const mutations = {
  /** 设置页面缩放值 */
  setScale: (state: State, scale: number): void => {
    if (SCALE_ARRAY.indexOf(scale) !== -1) {
      state.scale = scale
    }
  },
  /** 设置笑脸状态，TODO 完善笑脸状态设置逻辑 */
  setFaceStatus: (state: State, faceStatus: ImgFaceType): void => {
    state.faceStatus = faceStatus
  },
  /** 设置游戏开始的时间（毫秒） */
  setGameStartTime: (state: State, time: number): void => {
    state.gameStartTime = time
  },
  /** 设置游戏速度 */
  setGameSpeed: (state: State, speed: number): void => {
    // 判断速度的值是否合法，不合法则不对游戏速度进行修改
    if (SPEED_ARRAY.indexOf(speed) !== -1) {
      state.gameSpeed = speed
    }
  },
  /** 设置游戏经过的时间（毫秒） */
  setGameElapsedTime: (state: State, time: number): void => {
    if (state.gameElapsedTime < time) {
      state.gameElapsedTime = time
      if (state.gameEventIndex < state.gameEvents.length - 1) {
        // 测试需要判断游戏是否结束，因为有的录像实际记录的事件可能超出时间限制
        while (!state.isGameOver && state.gameEventIndex < state.gameEvents.length - 1 && state.gameElapsedTime >= state.gameEvents[state.gameEventIndex].time) {
          // 循环模拟下一个游戏事件
          store.commit('performNextEvent')
        }
      } else {
        // 检查游戏是否结束
        store.commit('checkVideoFinished')
      }

      // 当前游戏经过时间大于目标时间，不一定是在录像回放的时候触发，也有可能在录像事件控制条的最大值小于当前游戏经过的时间时触发
    } else if (state.gameElapsedTime > time) {
      state.gameElapsedTime = time
      // 如果当前游戏经过时间比最后一个游戏事件的时间还大，则不用循环模拟上一个游戏事件，判断是否需要修改游戏结束状态即可，笑脸状态会跟着游戏结束状态动态改变
      if (state.gameElapsedTime >= state.gameEvents[state.gameEvents.length - 1].time) {
        // 当目标时间小于游戏限制的最大时间时，重置游戏结束状态，保证录像可以按当前进度继续播放
        store.state.isGameOver = time < TIME_MAX * 1000 ? false : store.state.isGameOver
        return
      }
      // 在上面逻辑的保证下，在此处游戏经过的时间一定小于最后一个游戏事件的时间，所以如果游戏事件索引超出数组长度的话可以直接重置
      state.gameEventIndex = Math.min(state.gameEventIndex, state.gameEvents.length - 1)
      // 模拟上一个游戏事件，需要与上一个游戏事件的时间进行比较，当游戏经过的时间小于等于 0 时，模拟所有剩余事件，将游戏状态全部重置
      while (state.gameEventIndex > 0 && (state.gameElapsedTime < state.gameEvents[state.gameEventIndex - 1].time || state.gameElapsedTime <= 0)) {
        // 循环模拟上一个游戏事件
        store.commit('performPreviousEvent')
      }
    }
  },
  /** 初始化游戏 */
  initGame: (state: State, {
    width,
    height,
    mines,
    player,
    bbbv,
    openings,
    islands,
    gZiNi,
    hZiNi
  }: { width: number, height: number, mines: number, player: string, bbbv: number, openings: number, islands: number, gZiNi: number, hZiNi: number }): void => {
    state.width = width
    state.height = height
    state.mines = mines
    // TODO 玩家名称字符串不同编码格式解析
    state.player = player
    state.bbbv = bbbv
    state.openings = openings
    state.islands = islands
    state.gZiNi = gZiNi
    state.hZiNi = hZiNi
    state.gameEvents = []
    // 没有覆盖设置的话默认为游戏失败
    state.isGameWon = false
  },
  /** 添加游戏事件 */
  addEvent: (state: State, event: GameEvent): void => {
    state.gameEvents.push(event)
  },
  /** 接收并处理录像数据 */
  receiveVideo: (state: State, payload: string): void => {
    try {
      parse(state, payload)
      store.commit('replayVideo')
    } catch (e) {
      console.log(e)
    }
  },
  /** 模拟上一个游戏事件 */
  performPreviousEvent: (state: State): void => {
    // 模拟上一个游戏事件需要先重置游戏结束的状态，避免游戏播放结束后模拟上一个游戏事件，导致无法从当前进度继续播放
    state.isGameOver = false
    // 根据事件索引获取游戏事件，并更新事件索引
    const event = state.gameEvents[--state.gameEventIndex]
    if (event.name === 'Solved3BV') {
      return
    }
    // 根据坐标获取索引
    const index = event.x + event.y * state.width
    // 根据快照还原图片状态
    state.gameBoard[index] = event.snapshot!.cellType
    // 根据快照还原笑脸状态
    state.faceStatus = event.snapshot!.faceStatus
    if ('precisionX' in event) {
      state.precisionX = event.precisionX
    }
    if ('precisionY' in event) {
      state.precisionY = event.precisionY
    }
  },
  /** 模拟下一个游戏事件 */
  performNextEvent: (state: State): void => {
    // 根据事件索引获取游戏事件，并更新事件索引
    const event = state.gameEvents[state.gameEventIndex++]
    if (event.name === 'Solved3BV') {
      store.commit('checkVideoFinished')
      return
    }
    // 根据坐标获取索引
    const index = event.x + event.y * state.width
    // 在更新前保存快照
    event.snapshot = {
      cellType: state.gameBoard[index],
      faceStatus: state.faceStatus
    }
    switch (event.name) {
      case 'Flag':
        state.gameBoard[index] = 'cell-flag'
        break
      case 'QuestionMark':
        state.gameBoard[index] = 'cell-question'
        break
      case 'RemoveQuestionMark':
        state.gameBoard[index] = 'cell-normal'
        break
      case 'RemoveFlag':
        state.gameBoard[index] = 'cell-normal'
        break
      case 'Press':
        state.gameBoard[index] = 'cell-press'
        break
      case 'Release':
        state.gameBoard[index] = 'cell-normal'
        break
      case 'Open':
        if (event.number !== -1) {
          // 这里不能作为游戏结束的标识，因为可能有多个雷被打开的情况
          state.gameBoard[index] = ('cell-number-' + event.number) as ImgCellType
        } else {
          state.gameBoard[index] = 'cell-mine-bomb'
        }
        break
      case 'ToggleQuestionMarkSetting':
        break
      case 'MouseMove':
        break
      case 'LeftPressWithShift':
        state.faceStatus = 'face-press-cell'
        break
      case 'LeftPress':
        state.faceStatus = 'face-press-cell'
        break
      case 'LeftClick':
        state.faceStatus = 'face-normal'
        break
      case 'RightPress':
        state.faceStatus = 'face-press-cell'
        break
      case 'RightClick':
        state.faceStatus = 'face-normal'
        break
      case 'MiddlePress':
        state.faceStatus = 'face-press-cell'
        break
      case 'MiddleClick':
        state.faceStatus = 'face-normal'
        break
    }
    if ('precisionX' in event) {
      state.precisionX = event.precisionX
    }
    if ('precisionY' in event) {
      state.precisionY = event.precisionY
    }
    store.commit('checkVideoFinished')
  },
  /** 重新播放游戏录像，TODO 进行函数节流处理 */
  replayVideo: (state: State): void => {
    // 重置变量
    state.gameBoard = Array.from(Array(state.width * state.height), () => 'cell-normal')
    state.gameElapsedTime = 0.0
    state.gameEventIndex = 0
    state.precisionX = 0
    state.precisionY = 0
    state.faceStatus = 'face-normal'
    state.isGameOver = false
    store.commit('playVideo')
  },
  /** 播放游戏录像，TODO 进行函数节流处理 */
  playVideo: (state: State): void => {
    // 重置变量
    state.gameVideoPaused = false
    state.gameStartTime = 0.0
    // 直接使用 requestAnimationFrame 回调的时间戳，可能会有较大误差，包括回调时间戳本身的误差和小数计算产生的误差，特别是在 Vuex 开启严格模式的时候
    requestAnimationFrame(function performEvent () {
      const timestamp = Date.now()
      if (state.isGameOver || state.gameVideoPaused) {
        return
      }
      // 更新游戏经过的时间（毫秒）,首次时间为 0 ms
      const elapsedTime = state.gameStartTime <= 0 ? 0 : timestamp - state.gameStartTime
      store.commit('setGameElapsedTime', plus(state.gameElapsedTime, times(elapsedTime, state.gameSpeed)))
      // 重置游戏开始时间（毫秒）
      store.commit('setGameStartTime', timestamp)
      window.requestAnimationFrame(performEvent)
    })
  },
  /** 切换游戏录像播放暂停状态，cancelAnimationFrame 方法没有效果，采用标识位的方式进行暂停处理，TODO 完善游戏录像暂停逻辑，进行函数节流处理 */
  pauseVideo: (state: State): void => {
    if (state.gameVideoPaused) {
      store.commit('playVideo')
    } else {
      state.gameVideoPaused = true
    }
  },
  /** 检查录像是否播放结束，TODO 处理录像意外结尾的情况，即没有雷被打开并且时间没有超时 */
  checkVideoFinished: (state: State): void => {
    // 下一个游戏事件
    const nextEvent = state.gameEvents[state.gameEventIndex + 1]
    if (
      // 游戏预期结果为胜利并且所有游戏事件均已模拟完成，则认为游戏已经结束
      (state.isGameWon && state.gameEventIndex >= state.gameEvents.length) ||
      // 当前还有游戏事件暂未模拟，但是游戏经过的时间已经到达游戏最大时间限制（大于等于），并且下个游戏事件的时间大于最大游戏时间限制，则认为游戏超时（失败）
      // 注意不能单独使用当前时间或者下个游戏事件的时间判断是否超时，因为当前事件和下个游戏事件中间可能还有一段没有任何事件发生的时间存在
      (state.gameElapsedTime >= TIME_MAX * 1000 && (!nextEvent || nextEvent.time > TIME_MAX * 1000))
    ) {
      // 设置游戏播放结束，会和 isGameWon 一起影响到笑脸状态的显示，此处如果要直接改变笑脸状态的话还需要一个变量储存当前的笑脸状态，否则在回放的时候会丢失上一个笑脸状态
      state.isGameOver = true
      // 设置游戏播放暂停，如果不设置的话，在游戏播放结束的状态被重置之后会误以为游戏还处于正常播放的状态
      state.gameVideoPaused = true
    }
  }
}

/** payload 参数可以为空的函数名称集合 */
const EmptyPayloadFunction = [
  'performPreviousEvent',
  'performNextEvent',
  'replayVideo',
  'playVideo',
  'pauseVideo',
  'checkVideoFinished'
] as const

/** payload 参数不能为空的函数类型集合 */
export type MutationsMustPayload = Omit<typeof mutations, typeof EmptyPayloadFunction[number]>

/** payload 参数可以为空的函数类型集合 */
export type MutationsEmptyPayload = Omit<typeof mutations, keyof MutationsMustPayload>
