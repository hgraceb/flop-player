<template>
  <skin-symbol :translate-x="0" :translate-y="translateY" name="border-bottom-left" />
  <skin-symbol :translate-x="horizontalTranslateX" :translate-y="translateY" name="border-horizontal-bottom" />
  <skin-symbol :translate-x="rightTranslateX" :translate-y="translateY" name="border-bottom-right" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'
import { SIZE_BORDER_BOTTOM, SIZE_BORDER_LOWER, SIZE_BORDER_MIDDLE, SIZE_BORDER_TOP, SIZE_BORDER_UPPER, SIZE_CELL, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'

export default defineComponent({
  components: { SkinSymbol },
  setup () {
    const translateY = computed(() => {
      return (SIZE_BORDER_TOP.height + SIZE_BORDER_UPPER.height + SIZE_BORDER_MIDDLE.height + SIZE_BORDER_LOWER.height * store.state.height * SIZE_CELL.height) * SVG_SCALE
    })
    const horizontalTranslateX = SIZE_BORDER_BOTTOM.widthLeft * SVG_SCALE
    const rightTranslateX = computed(() => {
      return (SIZE_BORDER_BOTTOM.widthLeft + store.state.width * SIZE_CELL.width) * SVG_SCALE
    })
    return { translateY, horizontalTranslateX, rightTranslateX }
  }
})
</script>
