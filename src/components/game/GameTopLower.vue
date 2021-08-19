<template>
  <skin-symbol :translate-x="0" :translate-y="translateY" name="border-middle-left" />
  <skin-symbol :translate-x="horizontalTranslateX" :translate-y="translateY" name="border-horizontal-middle" />
  <skin-symbol :translate-x="rightTranslateX" :translate-y="translateY" name="border-middle-right" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { SIZE_BORDER_MIDDLE, SIZE_BORDER_TOP, SIZE_BORDER_UPPER, SIZE_CELL, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'

export default defineComponent({
  components: { SkinSymbol },
  setup () {
    const translateY = (SIZE_BORDER_TOP.height + SIZE_BORDER_UPPER.height) * SVG_SCALE
    // 水平边框的 X 轴坐标偏移量
    const horizontalTranslateX = SIZE_BORDER_MIDDLE.widthLeft * SVG_SCALE
    // 右边框的 X 轴坐标偏移量
    const rightTranslateX = computed(() => {
      return (SIZE_BORDER_MIDDLE.widthLeft + store.state.width * SIZE_CELL.width) * SVG_SCALE
    })
    return { translateY, horizontalTranslateX, rightTranslateX }
  }
})
</script>
