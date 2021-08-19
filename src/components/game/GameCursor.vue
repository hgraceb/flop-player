<template>
  <skin-symbol :translate-x="cursorTranslateX" :translate-y="cursorTranslateY" name="cursor-arrow" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { store } from '@/store'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'
import { GAME_MIDDLE, GAME_TOP_LOWER, GAME_TOP_UPPER, GAME_TOP_MIDDLE, SVG_SCALE } from '@/game/constants'

export default defineComponent({
  components: { SkinSymbol },
  setup () {
    // 指针 X 轴坐标位置
    const cursorTranslateX = computed(() => (GAME_MIDDLE.widthLeft + store.state.precisionX) * SVG_SCALE)
    // 指针 Y 轴坐标位置
    const cursorTranslateY = computed(() => {
      return (GAME_TOP_UPPER.height + GAME_TOP_MIDDLE.height + GAME_TOP_LOWER.height + store.state.precisionY) * SVG_SCALE
    })

    return { cursorTranslateX, cursorTranslateY }
  }
})
</script>
