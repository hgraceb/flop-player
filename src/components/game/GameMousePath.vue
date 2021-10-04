<template>
  <g v-if="display.isMousePath" :transform="`translate(${translateX} ${translateY})`">
    <!-- 遮罩 -->
    <path :d="`M0 0 H ${maskWidth} V ${maskHeight} H 0 L 0 0`" class="mouse-mask" />
    <!-- 鼠标路径 -->
    <polyline v-if="display.isMousePathMove" ref="mousePathElement" class="mouse-path" points="" />
    <!-- 鼠标左键坐标点 -->
    <polygon v-if="display.isMousePathLeft" ref="mouseLeftElement" class="mouse-left" points="" />
    <!-- 鼠标右键坐标点 -->
    <polygon v-if="display.isMousePathRight" ref="mouseRightElement" class="mouse-right" points="" />
    <!-- 鼠标双击坐标点 -->
    <polygon v-if="display.isMousePathDouble" ref="mouseDoubleElement" class="mouse-double" points="" />
  </g>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, Ref, watch } from 'vue'
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
// 处理对应折线图的点坐标列表
const handleLinePoints = (polygonElementRef: Ref<SVGPolylineElement | undefined>, targetPoints: { x: number; y: number }[]) => {
  // 选择直接操作 SVGPointList 是因为路径点位数据很多，按照字符串形式进行处理的话容易造成页面卡顿，就算自己维护一个和 SVGPointList 类似的数组，也会有页面卡顿的问题
  // 比如将 ['M 0 0', 'L 16 16'] 作为参数传递给 path 标签画一条线，最后也是将字符串数组转成了字符串，当点位越来越多，拖动进度条进行测试可以感受到明显的卡顿
  // polyline 和 polygon 标签对外提供了 SVGPointList 及其对应的属性还有方法，应该是内部专门做了优化，即使点位比较多，拖动进度条的时候也还是比较流畅 ヽ(✿ﾟ▽ﾟ)ノ
  // 测试时候最主要的依据是播放高级录像时拖动进度条是否会有明显卡顿现象，Chrome 的 Performance 面板感觉有比较大的偶然性，最好是简单看下不同内容的耗时占比就行
  // 没有特殊需求的话就尽量使用 polyline 和 polygon 标签，需要使用 path 的时候可以先调研一下其他框架是如何处理的，标签过多或者同个标签内容过多都容易造成卡顿
  const points = polygonElementRef.value?.points
  // 如果鼠标路径对应的元素没有被渲染，则不进行后续操作
  if (!points) return

  // 需要处理的点坐标个数
  const length = targetPoints.length
  // 已经处理过的点坐标个数
  const prevLength = points.length
  if (length === 0) {
    // 清空鼠标路径点位数据
    points.clear()
  } else if (length > prevLength) {
    // 新增鼠标路径点位数据
    for (let i = prevLength; i < length; i++) {
      const point = targetPoints[i]
      appendPoint(points, point.x * SVG_SCALE, point.y * SVG_SCALE)
    }
  } else if (length < prevLength) {
    // 移除鼠标路径点位数据
    for (let i = prevLength - 1; i >= length; i--) {
      points.removeItem(i)
    }
  }
}
// 处理对应正方形散点的点坐标列表
const handleSquareList = (polygonElementRef: Ref<SVGPolygonElement | undefined>, targetPoints: { x: number; y: number }[]) => {
  const points = polygonElementRef.value?.points
  if (!points) return

  const length = targetPoints.length
  const prevLength = Math.floor(points.length / squarePoints)
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
    const mouseLeftElement = ref<SVGPolygonElement | undefined>()
    // 鼠标右键坐标点对应的元素
    const mouseRightElement = ref<SVGPolygonElement | undefined>()
    // 鼠标双击坐标点对应的元素
    const mouseDoubleElement = ref<SVGPolygonElement | undefined>()
    // 轨迹图显示状态
    const display = reactive({
      isMousePath: computed(() => store.state.isMousePath),
      isMousePathMove: computed(() => store.state.isMousePathMove),
      isMousePathLeft: computed(() => store.state.isMousePathLeft),
      isMousePathRight: computed(() => store.state.isMousePathRight),
      isMousePathDouble: computed(() => store.state.isMousePathDouble)
    })

    onMounted(() => {
      // 鼠标移动路径，监听 mousePathElement 是因为元素重新渲染时需要重绘所有点坐标
      watch([mousePathElement, computed(() => store.state.gameMousePoints.length)], () => {
        handleLinePoints(mousePathElement, store.state.gameMousePoints)
      })
      // 鼠标左键坐标点
      watch([mouseLeftElement, computed(() => store.state.gameLeftPoints.length)], () => {
        handleSquareList(mouseLeftElement, store.state.gameLeftPoints)
      })
      // 鼠标右键坐标点
      watch([mouseRightElement, computed(() => store.state.gameRightPoints.length)], () => {
        handleSquareList(mouseRightElement, store.state.gameRightPoints)
      })
      // 鼠标双击坐标点
      watch([mouseDoubleElement, computed(() => store.state.gameDoublePoints.length)], () => {
        handleSquareList(mouseDoubleElement, store.state.gameDoublePoints)
      })
    })

    return { translateX, translateY, display, maskWidth, maskHeight, mousePathElement, mouseLeftElement, mouseRightElement, mouseDoubleElement }
  }
})
</script>

<style scoped>
/* 遮罩 */
.mouse-mask {
  fill: rgba(0, 0, 0, .5);
}

/* 鼠标路径 */
.mouse-path {
  fill: none;
  stroke: white;
  stroke-width: 10;
}

/* 鼠标左键坐标点 */
.mouse-left {
  fill: #00ffff;
  stroke: none;
}

/* 鼠标右键坐标点 */
.mouse-right {
  fill: #00ff00;
  stroke: none;
}

/* 鼠标双击坐标点 */
.mouse-double {
  fill: #ff00ff;
  stroke: none;
}
</style>
