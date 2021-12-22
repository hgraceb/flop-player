/**
 * 获取字符串宽度
 *
 * @param str  字符串
 * @param font 字号和字体，如：'10px sans-serif'
 */
export function getStrWidth (str: string, font?: string): number | null {
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return null
  // 指定 font-size 和 font-family，获取精确宽度
  ctx.font = font || ctx.font
  return ctx.measureText(str).width
}
