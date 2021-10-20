<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <!-- 背景颜色，用于修正部分缩放比例下有白边的问题，7.89 是为了填充游戏区域顶部和左侧与边框之前的白边，也是为了尽量不影响正常的图片显示 -->
    <path :d="`M -7.89 -7.89 h ${gameWidth * 160 + 7.89} v 15.78 h ${gameWidth * -160 + 7.89} v ${gameHeight * 160 - 7.89} h -15.78 Z`" fill="gray" fill-opacity="1" />
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
import { CELL_SIDE_LENGTH, GAME_MIDDLE, GAME_TOP_LOWER, GAME_TOP_MIDDLE, GAME_TOP_UPPER, SVG_SCALE } from '@/game/constants'
import { ImgCellType } from '@/util/image'

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

    return { translateX, translateY, gameWidth, gameHeight, getCellImg, getTranslateX, getTranslateY }
  }
})
</script>
