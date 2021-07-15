import { GameStatus } from '@/status'

export const state = {
  gameOver: false,
  gameStatus: GameStatus.PLAY
}

export type State = typeof state
