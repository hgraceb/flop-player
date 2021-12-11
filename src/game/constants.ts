/**
 * 页面缩放值，数值定义由小到大
 */
export const SCALE_ARRAY = [
  0.50, 0.75, 1.00, 1.25, 1.50, 2.00, 3.00, 4.00, 5.00, 10.00
]

/**
 * 游戏速度，数值定义由小到大，因为当前游戏速度缓存到了本地，删除部分预设值的时候要注意测试与旧版本的兼容性
 */
export const SPEED_ARRAY = [
  0.01, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95,
  1.00,
  1.10, 1.20, 1.30, 1.40, 1.50, 1.60, 1.70, 1.80, 1.90, 2.00, 3.00, 4.00, 5.00, 6.00, 7.00, 8.00, 9.00, 10.0, 15.0, 20.0
]

/**
 * SVG 放大倍数
 */
export const SVG_SCALE = 10

/**
 * 游戏顶部上半部分的宽高信息
 */
export const GAME_TOP_UPPER = {
  height: 11,
  widthLeft: 12,
  widthRight: 12
}

/**
 * 游戏顶部中间部分边框的宽高信息
 */
export const GAME_TOP_MIDDLE = {
  height: 33,
  widthLeft: GAME_TOP_UPPER.widthLeft
}

/**
 * 游戏顶部下半部分的宽高信息
 */
export const GAME_TOP_LOWER = {
  height: GAME_TOP_UPPER.height,
  widthLeft: GAME_TOP_UPPER.widthLeft
}

/**
 * 游戏中间部分两侧的高度信息
 */
export const GAME_MIDDLE = {
  widthLeft: GAME_TOP_UPPER.widthLeft
}

/**
 * 游戏底部上半部分的宽高信息
 */
export const GAME_BOTTOM_UPPER = {
  height: 9,
  widthLeft: GAME_TOP_UPPER.widthLeft
}

/**
 * 游戏底部中间部分的宽高信息
 */
export const GAME_BOTTOM_MIDDLE = {
  height: 16,
  widthLeft: GAME_TOP_UPPER.widthLeft
}

/**
 * 游戏底部下半部分的宽高信息
 */
export const GAME_BOTTOM_LOWER = {
  height: 9,
  widthLeft: GAME_TOP_UPPER.widthLeft
}

/**
 * 方块边长信息
 */
export const SQUARE_SIZE = 16

/**
 * 计数器数字 SVG 宽高信息
 */
export const SIZE_COUNT_NUMBER = {
  width: 11,
  height: 21
}

/**
 * 笑脸 SVG 宽高信息
 */
export const SIZE_FACE = {
  width: 26,
  height: 26
}

/**
 * 计数器背景 SVG 宽高信息
 */
export const SIZE_COUNTERS = {
  width: 41,
  height: 25
}
