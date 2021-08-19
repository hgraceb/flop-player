<template>
  <skin-symbol :translate-x="0" :translate-y="translateY" name="border-bottom-left" />
  <skin-symbol :translate-x="horizontalTranslateX" :translate-y="translateY" name="border-horizontal-bottom" />
  <skin-symbol :translate-x="rightTranslateX" :translate-y="translateY" name="border-bottom-right" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'
import { GAME_TOP_LOWER, GAME_TOP_MIDDLE, GAME_TOP_UPPER, GAME_BOTTOM_UPPER, SIZE_CELL, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'

export default defineComponent({
  components: { SkinSymbol },
  setup () {
    const translateY = computed(() => {
      return (GAME_TOP_UPPER.height + GAME_TOP_MIDDLE.height + GAME_TOP_LOWER.height + store.state.height * SIZE_CELL.height) * SVG_SCALE
    })
    const horizontalTranslateX = GAME_BOTTOM_UPPER.widthLeft * SVG_SCALE
    const rightTranslateX = computed(() => {
      return (GAME_BOTTOM_UPPER.widthLeft + store.state.width * SIZE_CELL.width) * SVG_SCALE
    })
    return { translateY, horizontalTranslateX, rightTranslateX }
  }
})
</script>
