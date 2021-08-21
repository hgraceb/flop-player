<template>
  <skin-symbol :translate-x="0" :translate-y="translateY" name="game-bottom-middle-left" />
  <skin-symbol :translate-x="centerTranslateX" :translate-y="translateY" name="game-bottom-middle-center" />
  <text :transform="`translate(${centerTranslateX} ${translateY})`" x="0" y="0">Flop</text>
  <skin-symbol :translate-x="rightTranslateX" :translate-y="translateY" name="game-bottom-middle-right" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { CELL_SIDE_LENGTH, GAME_BOTTOM_MIDDLE, GAME_BOTTOM_UPPER, GAME_TOP_LOWER, GAME_TOP_MIDDLE, GAME_TOP_UPPER, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'

export default defineComponent({
  components: { SkinSymbol },
  setup () {
    const translateY = computed(() => {
      return (GAME_TOP_UPPER.height + GAME_TOP_MIDDLE.height + GAME_TOP_LOWER.height + store.state.height * CELL_SIDE_LENGTH + GAME_BOTTOM_UPPER.height) * SVG_SCALE
    })
    // 背景的 X 轴坐标偏移量
    const centerTranslateX = computed(() => {
      return GAME_BOTTOM_MIDDLE.widthLeft * SVG_SCALE
    })
    // 右边框的 X 轴坐标偏移量
    const rightTranslateX = computed(() => {
      return (GAME_BOTTOM_MIDDLE.widthLeft + store.state.width * CELL_SIDE_LENGTH) * SVG_SCALE
    })
    return { translateY, centerTranslateX, rightTranslateX }
  }
})
</script>
