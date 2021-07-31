/**
 * 方块图片资源
 */
export const CellImg = {
  Flag: 'cell-flag',
  FlagWrong: 'cell-flag-wrong',
  Mine: 'cell-mine',
  MineBomb: 'cell-mine-bomb',
  Normal: 'cell-normal',
  Number0: 'cell-number-0',
  Number1: 'cell-number-1',
  Number2: 'cell-number-2',
  Number3: 'cell-number-3',
  Number4: 'cell-number-4',
  Number5: 'cell-number-5',
  Number6: 'cell-number-6',
  Number7: 'cell-number-7',
  Number8: 'cell-number-8',
  Press: 'cell-press',
  Question: 'cell-question',
  QuestionPress: 'cell-question-press'
} as const

/**
 * 笑脸图片资源
 */
export const ImgFace = [
  'face-normal',
  'face-press-cell',
  'face-press-normal',
  'face-win',
  'face-lose'
] as const

export type TypeImgFace = typeof ImgFace[number]
