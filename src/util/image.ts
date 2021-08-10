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
export const isValidImgCell = (value: ImgCellType): boolean => ImgCell.includes(value)

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
export const isValidImgFace = (value: ImgFaceType): boolean => ImgFace.includes(value)

/**
 * 边框图片资源，TODO 删除 SkinSprites 中多余的代码
 */
const ImgBorder = [
  'border-bottom-left',
  'border-bottom-right',
  'border-horizontal-bottom',
  'border-horizontal-middle',
  'border-horizontal-top',
  'border-middle-left',
  'border-middle-right',
  'border-top-left',
  'border-top-right',
  'border-vertical-left-lower',
  'border-vertical-left-upper',
  'border-vertical-right-lower',
  'border-vertical-right-upper'
] as const
export type ImgBorderType = typeof ImgBorder[number]
export const isValidImgBorder = (value: ImgBorderType): boolean => ImgBorder.includes(value)
