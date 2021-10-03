<template>
  <g :transform="`translate(${translateX} ${translateY})`" class="container-mouse-path">
    <!-- 遮罩 -->
    <path :d="`M0 0 H ${maskWidth} V ${maskHeight} H 0 L 0 0`" style="fill: rgba(0, 0, 0, .5);" />
    <!-- 鼠标路径 -->
    <polyline ref="mousePathElement" class="mouse-path" points="" />
    <!-- 鼠标左键坐标点 -->
    <polygon ref="leftPointsElement" class="left-points" points="" />
    <!-- 鼠标右键坐标点 -->
    <polygon ref="rightPointsElement" class="right-points" points="" />
    <!-- 鼠标双击坐标点 -->
    <polygon ref="doublePointsElement" class="double-points" points="" />
  </g>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref, watch } from 'vue'
import { store } from '@/store'
import { CELL_SIDE_LENGTH, GAME_MIDDLE, GAME_TOP_LOWER, GAME_TOP_MIDDLE, GAME_TOP_UPPER, SVG_SCALE } from '@/game/constants'

// SVG 元素，用于创建 SVGPoint 对象，因为 SVGPoint 没有单独的构造方法
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
// 绘制一个正方形路径需要的点坐标个数
const squarePoints = 6
// 添加一个点坐标
const appendPoint = (points: SVGPointList, x: number, y: number) => {
  const svgPoint = svg.createSVGPoint()
  svgPoint.x = x
  svgPoint.y = y
  // eslint-disable-next-line no-unused-expressions
  points.appendItem(svgPoint)
}
// 从最后添加一个正方形路径
const appendSquare = (points: SVGPointList, x: number, y: number) => {
  // 偏移量，正方形路径的边长为 5
  const offset = 2.5 * SVG_SCALE
  // (0, 0) 坐标的作用是将填充区域限制在需要绘制的正方形内部
  appendPoint(points, 0, 0)
  // 依次添加正方形四个角的点坐标
  appendPoint(points, x - offset, y - offset)
  appendPoint(points, x + offset, y - offset)
  appendPoint(points, x + offset, y + offset)
  appendPoint(points, x - offset, y + offset)
  // 将正方形路径闭合
  appendPoint(points, x - offset, y - offset)
}
// 从最后移除一个正方形路径
const removeSquare = (points: SVGPointList) => {
  for (let i = 0; i < squarePoints; i++) {
    points.removeItem(points.length - 1)
  }
}
// 处理点坐标列表
const handlePointList = (polygonElementRef: Ref<SVGPolygonElement | undefined>, targetPoints: { x: number; y: number }[], length: number, prevLength: number) => {
  const points = polygonElementRef.value?.points
  if (!points) return

  if (length === 0) {
    points.clear()
  } else if (length > prevLength) {
    for (let i = prevLength; i < length; i++) {
      const point = targetPoints[i]
      // 从最后添加一个正方形路径
      appendSquare(points, point.x * SVG_SCALE, point.y * SVG_SCALE)
    }
  } else if (length < prevLength) {
    for (let i = length; i < prevLength; i++) {
      // 从最后移除一个正方形路径
      removeSquare(points)
    }
  }
}

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
    // 鼠标路径对应的元素
    const mousePathElement = ref<SVGPolylineElement | undefined>()
    // 鼠标左键坐标点对应的元素
    const leftPointsElement = ref<SVGPolygonElement | undefined>()
    // 鼠标右键坐标点对应的元素
    const rightPointsElement = ref<SVGPolygonElement | undefined>()
    // 鼠标双击坐标点对应的元素
    const doublePointsElement = ref<SVGPolygonElement | undefined>()

    onMounted(() => {
      watch(computed(() => store.state.gameMousePoints.length), length => {
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
            const point = store.state.gameMousePoints[i]
            appendPoint(points, point.x * SVG_SCALE, point.y * SVG_SCALE)
          }
        } else if (length < points.length) {
          // 移除鼠标路径点位数据
          for (let i = points.length - 1; i >= length; i--) {
            points.removeItem(i)
          }
        }
      })

      // 鼠标左键坐标点
      watch(computed(() => store.state.gameLeftPoints.length), (length, prevLength) => {
        handlePointList(leftPointsElement, store.state.gameLeftPoints, length, prevLength)
      })
      // 鼠标右键坐标点
      watch(computed(() => store.state.gameRightPoints.length), (length, prevLength) => {
        handlePointList(rightPointsElement, store.state.gameRightPoints, length, prevLength)
      })
      // 鼠标双击坐标点
      watch(computed(() => store.state.gameDoublePoints.length), (length, prevLength) => {
        handlePointList(doublePointsElement, store.state.gameDoublePoints, length, prevLength)
      })
    })

    return { translateX, translateY, maskWidth, maskHeight, mousePathElement, leftPointsElement, rightPointsElement, doublePointsElement }
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

/* 鼠标左键坐标点 */
.left-points {
  fill: #00ffff;
  stroke: none;
}

/* 鼠标右键坐标点 */
.right-points {
  fill: #00ff00;
  stroke: none;
}

/* 鼠标双击坐标点 */
.double-points {
  fill: #ff00ff;
  stroke: none;
}
</style>
