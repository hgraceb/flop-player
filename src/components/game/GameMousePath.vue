<template>
  <g :transform="`translate(${translateX} ${translateY})`" class="container-mouse-path">
    <!-- 遮罩 -->
    <path :d="`M0 0 H ${maskWidth} V ${maskHeight} H 0 L 0 0`" style="fill: rgba(0, 0, 0, .5);" />
    <!-- 鼠标路径 -->
    <polyline ref="mousePathElement" class="mouse-path" points="" />
  </g>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { store } from '@/store'
import { CELL_SIDE_LENGTH, GAME_MIDDLE, GAME_TOP_LOWER, GAME_TOP_MIDDLE, GAME_TOP_UPPER, SVG_SCALE } from '@/game/constants'

export default defineComponent({
  setup () {
    // 轨迹图整体的 X 轴坐标偏移量
    const translateX = (GAME_MIDDLE.widthLeft) * SVG_SCALE
    // 轨迹图整体的 Y 轴坐标偏移量
    const translateY = (GAME_TOP_UPPER.height + GAME_TOP_MIDDLE.height + GAME_TOP_LOWER.height) * SVG_SCALE
    // 遮罩宽度
    const maskWidth = computed(() => store.state.width * CELL_SIDE_LENGTH * SVG_SCALE)
    // 遮罩高度
    const maskHeight = computed(() => store.state.height * CELL_SIDE_LENGTH * SVG_SCALE)
    // SVG 元素，用于创建 SVGPoint 对象，因为 SVGPoint 没有单独的构造方法
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    // 鼠标路径对应的元素
    const mousePathElement = ref<SVGPolylineElement>()

    onMounted(() => {
      watch(computed(() => store.state.gameMousePath.length), length => {
        // 选择直接操作 SVGPointList 是因为路径点位数据很多，按照字符串形式进行处理的话容易造成页面卡顿
        const points = mousePathElement.value?.points
        // 如果鼠标路径对应的元素没有被渲染，则不进行后续操作
        if (!points) return

        if (length === 0) {
          // 清空鼠标路径点位数据
          points.clear()
        } else if (length > points.length) {
          // 新增鼠标路径点位数据
          for (let i = points.length; i < length; i++) {
            const point = store.state.gameMousePath[i]
            if (point) {
              const svgPoint = svg.createSVGPoint()
              svgPoint.x = point.x * SVG_SCALE
              svgPoint.y = point.y * SVG_SCALE
              // eslint-disable-next-line no-unused-expressions
              points.appendItem(svgPoint)
            }
          }
        } else if (points.length > length) {
          // 移除鼠标路径点位数据
          for (let i = points.length - 1; i >= length; i--) {
            points.removeItem(i)
          }
        }
      })
    })

    return { translateX, translateY, maskWidth, maskHeight, mousePathElement }
  }
})
</script>

<style scoped>
/* 鼠标路径 */
.mouse-path {
  fill: none;
  stroke: white;
  stroke-width: 10;
}
</style>
