/**
 * 页面缩放值，数值定义由小到大
 */
export const SCALE_ARRAY = [
  0.50, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00, 2.50, 3.00, 4.00, 5.00, 6.00, 7.00, 8.00, 9.00, 10.00
]

/**
 * 游戏速度，数值定义由小到大
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
 * 顶部边框 SVG 宽高信息
 */
export const SIZE_BORDER_TOP = {
  height: 11,
  widthLeft: 12,
  widthRight: 12,
  widthHorizontal: 1
}

/**
 * 计数器部分边框 SVG 宽高信息
 */
export const SIZE_BORDER_COUNTERS = {
  width: 12,
  height: 33
}

/**
 * 中部部边框 SVG 宽高信息
 */
export const SIZE_BORDER_MIDDLE = SIZE_BORDER_TOP

/**
 * 底部边框 SVG 宽高信息
 */
export const SIZE_BORDER_BOTTOM = {
  height: 12,
  widthLeft: SIZE_BORDER_TOP.widthLeft,
  widthRight: SIZE_BORDER_TOP.widthRight,
  widthHorizontal: SIZE_BORDER_TOP.widthHorizontal
}

/**
 * 方块 SVG 宽高信息
 */
export const SIZE_CELL = {
  width: 16,
  height: 16
}

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
