<template>
  <skin-symbol :translate-x="0" :translate-y="translateY" name="border-middle-left" />
  <skin-symbol :translate-x="horizontalTranslateX" :translate-y="translateY" name="border-horizontal-middle" />
  <skin-symbol :translate-x="rightTranslateX" :translate-y="translateY" name="border-middle-right" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { CELL_SIDE_LENGTH, GAME_TOP_LOWER, GAME_TOP_MIDDLE, GAME_TOP_UPPER, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'

export default defineComponent({
  components: { SkinSymbol },
  setup () {
    const translateY = (GAME_TOP_UPPER.height + GAME_TOP_MIDDLE.height) * SVG_SCALE
    // 水平边框的 X 轴坐标偏移量
    const horizontalTranslateX = GAME_TOP_LOWER.widthLeft * SVG_SCALE
    // 右边框的 X 轴坐标偏移量
    const rightTranslateX = computed(() => {
      return (GAME_TOP_LOWER.widthLeft + store.state.width * CELL_SIDE_LENGTH) * SVG_SCALE
    })
    return { translateY, horizontalTranslateX, rightTranslateX }
  }
})
</script>
