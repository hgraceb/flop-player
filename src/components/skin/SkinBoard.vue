<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <template v-for="(item, height) in gameHeight" :key="item">
      <skin-symbol
        v-for="(item, width) in gameWidth"
        :key="item"
        :name="getCellImg(width, height)"
        :translate-x="getTranslateX(width)"
        :translate-y="getTranslateY(height)"
      />
    </template>
  </g>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { store } from '@/store'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'
import {
  SIZE_BORDER_LOWER,
  SIZE_BORDER_MIDDLE,
  SIZE_BORDER_TOP,
  SIZE_BORDER_UPPER,
  SIZE_CELL,
  SVG_SCALE
} from '@/game/constants'
import { ImgCellType } from '@/util/image'

export default defineComponent({
  components: { SkinSymbol },
  setup () {
    // 游戏棋盘整体的 X 轴坐标偏移量
    const translateX = (SIZE_BORDER_LOWER.width) * SVG_SCALE
    // 游戏棋盘整体的 Y 轴坐标偏移量
    const translateY = (SIZE_BORDER_TOP.height + SIZE_BORDER_UPPER.height + SIZE_BORDER_MIDDLE.height) * SVG_SCALE
    // 游戏宽度
    const gameWidth = computed(() => store.state.width)
    // 游戏高度
    const gameHeight = computed(() => store.state.height)
    // 根据横坐标和纵坐标获取方块的图片名称
    const getCellImg = (width: number, height: number): ImgCellType => {
      // 如果游戏棋盘信息为空，则返回默认值
      if (store.state.gameBoard.length === 0) {
        return 'cell-normal'
      }
      return store.state.gameBoard[width + height * gameHeight.value]
    }
    // 根据横坐标获取 X 轴坐标偏移量
    const getTranslateX = (width: number): number => {
      return width * SIZE_CELL.width * SVG_SCALE
    }
    // 根据纵坐标获取 Y 轴坐标偏移量
    const getTranslateY = (height: number): number => {
      return height * SIZE_CELL.height * SVG_SCALE
    }
    return { translateX, translateY, gameWidth, gameHeight, getCellImg, getTranslateX, getTranslateY }
  }
})
</script>
