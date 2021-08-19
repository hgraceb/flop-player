<template>
  <text :transform="`translate(${translateX} ${translateY})`" x="0" y="0">I love SVG</text>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { CELL_SIDE_LENGTH, GAME_TOP_MIDDLE, GAME_TOP_UPPER, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'

export default defineComponent({
  setup () {
    // 顶部重开区域背景的 X 轴坐标偏移量
    const translateX = computed(() => {
      return GAME_TOP_MIDDLE.widthLeft * SVG_SCALE
    })
    // 顶部重开区域背景的 Y 轴坐标偏移量
    const translateY = GAME_TOP_UPPER.height * SVG_SCALE
    // 顶部重开区域背景的高度
    const width = computed(() => store.state.width * CELL_SIDE_LENGTH * SVG_SCALE)
    // 顶部重开区域背景的宽度
    const height = GAME_TOP_MIDDLE.height * SVG_SCALE
    return { translateX, translateY, width, height }
  }
})
</script>
