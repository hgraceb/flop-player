<template>
  <skin-symbol :translate-x="cursorTranslateX" :translate-y="cursorTranslateY" name="cursor-arrow" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { store } from '@/store'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'
import { SIZE_BORDER_LOWER, SIZE_BORDER_MIDDLE, SIZE_BORDER_TOP, SIZE_BORDER_UPPER, SVG_SCALE } from '@/game/constants'

export default defineComponent({
  components: { SkinSymbol },
  setup () {
    // 指针 X 轴坐标位置
    const cursorTranslateX = computed(() => (SIZE_BORDER_LOWER.width + store.state.precisionX) * SVG_SCALE)
    // 指针 Y 轴坐标位置
    const cursorTranslateY = computed(() => {
      return (SIZE_BORDER_TOP.height + SIZE_BORDER_UPPER.height + SIZE_BORDER_MIDDLE.height + store.state.precisionY) * SVG_SCALE
    })

    return { cursorTranslateX, cursorTranslateY }
  }
})
</script>
