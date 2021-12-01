<template>
  <!-- 背景颜色，用于修正部分缩放比例下有白边的问题，7.89 是为了填充游戏区域顶部和左侧与边框之前的白边，也是为了尽量不影响正常的图片显示 -->
  <path :d="`M -7.89 -7.89 h ${gameWidth * 160 + 7.89} v 15.78 h ${gameWidth * -160 + 7.89} v ${gameHeight * 160 - 7.89} h -15.78 Z`" fill="gray" />
  <!-- 方块容器，除了方块不要放其他元素，避免鼠标事件的坐标位置获取错误 -->
  <g ref="boardElement" :transform="`translate(${translateX} ${translateY})`">
    <template v-for="(item, height) in gameHeight" :key="item">
      <skin-symbol
        v-for="(item, width) in gameWidth"
        :key="item"
        :name="getCellImg(width, height)"
        :onmousedown="cellMouseHandler"
        :onmouseup="cellMouseHandler"
        :translate-x="getTranslateX(width)"
        :translate-y="getTranslateY(height)"
      />
    </template>
  </g>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { store } from '@/store'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'
import { CELL_SIDE_LENGTH, GAME_MIDDLE, GAME_TOP_LOWER, GAME_TOP_MIDDLE, GAME_TOP_UPPER, SVG_SCALE } from '@/game/constants'
import { ImgCellType } from '@/util/image'
import { round } from 'number-precision'

export default defineComponent({
  components: { SkinSymbol },
  setup () {
    // 游戏棋盘整体的 X 轴坐标偏移量
    const translateX = (GAME_MIDDLE.widthLeft) * SVG_SCALE
    // 游戏棋盘整体的 Y 轴坐标偏移量
    const translateY = (GAME_TOP_UPPER.height + GAME_TOP_MIDDLE.height + GAME_TOP_LOWER.height) * SVG_SCALE
    // 游戏宽度
    const gameWidth = computed(() => store.state.width)
    // 游戏高度
    const gameHeight = computed(() => store.state.height)
    // 根据横坐标和纵坐标获取方块的图片名称
    const getCellImg = (width: number, height: number): ImgCellType => {
      // 如果游戏棋盘信息为空，则返回默认值
      if (store.state.gameImgBoard.length === 0) {
        return 'cell-normal'
      }
      return store.state.gameImgBoard[width + height * gameWidth.value]
    }
    // 根据横坐标获取 X 轴坐标偏移量
    const getTranslateX = (width: number): number => {
      return width * CELL_SIDE_LENGTH * SVG_SCALE
    }
    // 根据纵坐标获取 Y 轴坐标偏移量
    const getTranslateY = (height: number): number => {
      return height * CELL_SIDE_LENGTH * SVG_SCALE
    }
    // 棋盘对应的元素
    const boardElement = ref<SVGPolylineElement>()
    // 处理方块的鼠标事件，TODO 完善鼠标事件处理，除了添加鼠标移动事件还要在 document 上监听鼠标事件、添加移动端的点击事件处理
    const cellMouseHandler = (e: MouseEvent) => {
      if (!boardElement.value) return
      // 阻止默认的点击事件执行
      e.preventDefault()
      // 阻止捕获和冒泡阶段中当前事件的进一步传播
      e.stopPropagation()
      // 获取方块容器的位置信息
      const rect = boardElement.value.getBoundingClientRect()
      // 在方块上点击时，限制横坐标最小值为 0，最大值为 width - 1，因为原始数据可能已经被四舍五入过，点击边缘位置时计算得到的值可能超出实际游戏范围
      const x = Math.max(0, Math.min(round(e.x - rect.x, 0), store.state.width * 16 - 1))
      // 在方块上点击时，限制纵坐标最小值为 0，最大值为 height - 1
      const y = Math.max(0, Math.min(round(e.y - rect.y, 0), store.state.height * 16 - 1))
      if (e.type === 'mousedown' && e.button === 0 && e.shiftKey) {
        console.log({ type: 'sc', x: x, y: y })
      } else if (e.type === 'mousedown' && e.button === 0) {
        console.log({ type: 'lc', x: x, y: y })
      } else if (e.type === 'mousedown' && e.button === 1) {
        console.log({ type: 'mc', x: x, y: y })
      } else if (e.type === 'mousedown' && e.button === 2) {
        console.log({ type: 'rc', x: x, y: y })
      } else if (e.type === 'mouseup' && e.button === 0) {
        console.log({ type: 'lr', x: x, y: y })
      } else if (e.type === 'mouseup' && e.button === 1) {
        console.log({ type: 'mr', x: x, y: y })
      } else if (e.type === 'mouseup' && e.button === 2) {
        console.log({ type: 'rr', x: x, y: y })
      }
    }

    return { translateX, translateY, gameWidth, gameHeight, getCellImg, getTranslateX, getTranslateY, boardElement, cellMouseHandler }
  }
})
</script>
