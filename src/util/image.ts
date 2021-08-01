/**
 * 方块图片资源
 */
const ImgCell = [
  'cell-flag',
  'cell-flag-wrong',
  'cell-mine',
  'cell-mine-bomb',
  'cell-normal',
  'cell-number-0',
  'cell-number-1',
  'cell-number-2',
  'cell-number-3',
  'cell-number-4',
  'cell-number-5',
  'cell-number-6',
  'cell-number-7',
  'cell-number-8',
  'cell-press',
  'cell-question',
  'cell-question-press'
] as const
export type ImgCellType = typeof ImgCell[number]
export const isValidImgCell = (value: ImgCellType) => ImgCell.includes(value)

/**
 * 笑脸图片资源
 */
const ImgFace = [
  'face-normal',
  'face-press-cell',
  'face-press-normal',
  'face-win',
  'face-lose'
] as const
export type ImgFaceType = typeof ImgFace[number]
export const isValidImgFace = (value: ImgFaceType) => ImgFace.includes(value)
