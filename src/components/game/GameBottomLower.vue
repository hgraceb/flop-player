<template>
  <skin-symbol :translate-x="0" :translate-y="translateY" name="game-bottom-lower-left" />
  <skin-symbol :translate-x="centerTranslateX" :translate-y="translateY" name="game-bottom-lower-center" />
  <skin-symbol :translate-x="rightTranslateX" :translate-y="translateY" name="game-bottom-lower-right" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'
import { CELL_SIDE_LENGTH, GAME_BOTTOM_LOWER, GAME_BOTTOM_MIDDLE, GAME_BOTTOM_UPPER, GAME_TOP_LOWER, GAME_TOP_MIDDLE, GAME_TOP_UPPER, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'

export default defineComponent({
  components: { SkinSymbol },
  setup () {
    const translateY = computed(() => {
      return (GAME_TOP_UPPER.height + GAME_TOP_MIDDLE.height + GAME_TOP_LOWER.height + store.state.height * CELL_SIDE_LENGTH + GAME_BOTTOM_UPPER.height + GAME_BOTTOM_MIDDLE.height) * SVG_SCALE
    })
    const centerTranslateX = GAME_BOTTOM_LOWER.widthLeft * SVG_SCALE
    const rightTranslateX = computed(() => {
      return (GAME_BOTTOM_LOWER.widthLeft + store.state.width * CELL_SIDE_LENGTH) * SVG_SCALE
    })
    return { translateY, centerTranslateX, rightTranslateX }
  }
})
</script>
