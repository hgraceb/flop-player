<template>
  <skin-symbol :translate-x="cursorTranslateX" :translate-y="cursorTranslateY" name="cursor-arrow" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { store } from '@/store'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'
import { GAME_MIDDLE, GAME_TOP_LOWER, GAME_TOP_MIDDLE, GAME_TOP_UPPER, SVG_SCALE } from '@/game/constants'

export default defineComponent({
  components: { SkinSymbol },
  setup () {
    // 当前鼠标的坐标位置，默认为 (0, 0)
    const currentMousePoint = computed(() => store.state.gameMousePoints[store.state.gameMousePoints.length - 1] || { x: 0, y: 0 })
    // 指针 X 轴坐标位置
    const cursorTranslateX = computed(() => (GAME_MIDDLE.widthLeft + currentMousePoint.value.x) * SVG_SCALE)
    // 指针 Y 轴坐标位置
    const cursorTranslateY = computed(() => {
      return (GAME_TOP_UPPER.height + GAME_TOP_MIDDLE.height + GAME_TOP_LOWER.height + currentMousePoint.value.y) * SVG_SCALE
    })

    return { cursorTranslateX, cursorTranslateY }
  }
})
</script>
