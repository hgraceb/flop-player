<template>
  <path :d="`M0 0L0 ${height}L${width} ${height}L${width} 0L0 0z`" :transform="`translate(${translateX} ${translateY})`" fill="silver" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { SIZE_BORDER_TOP, SIZE_BORDER_UPPER, SIZE_CELL, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'

export default defineComponent({
  setup () {
    // 顶部重开区域背景的 X 轴坐标偏移量
    const translateX = computed(() => {
      return SIZE_BORDER_UPPER.width * SVG_SCALE
    })
    // 顶部重开区域背景的 Y 轴坐标偏移量
    const translateY = SIZE_BORDER_TOP.height * SVG_SCALE
    // 顶部重开区域背景的高度
    const width = computed(() => store.state.width * SIZE_CELL.width * SVG_SCALE)
    // 顶部重开区域背景的宽度
    const height = SIZE_BORDER_UPPER.height * SVG_SCALE
    return { translateX, translateY, width, height }
  }
})
</script>
