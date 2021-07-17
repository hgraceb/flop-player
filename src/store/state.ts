import { GameStatus } from '@/status'

export const state = {
  gameOver: false,
  gameStatus: GameStatus.Play
}

export type State = typeof state
