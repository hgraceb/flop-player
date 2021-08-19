<template>
  <skin-symbol :translate-x="0" :translate-y="translateY" name="border-vertical-left-lower" />
  <skin-symbol :translate-x="rightTranslateX" :translate-y="translateY" name="border-vertical-right-lower" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { SIZE_BORDER_LOWER, SIZE_BORDER_MIDDLE, SIZE_BORDER_TOP, SIZE_BORDER_UPPER, SIZE_CELL, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'

export default defineComponent({
  components: { SkinSymbol },
  setup () {
    const translateY = computed(() => {
      return (SIZE_BORDER_TOP.height + SIZE_BORDER_UPPER.height + SIZE_BORDER_MIDDLE.height) * SVG_SCALE
    })
    const rightTranslateX = computed(() => {
      return (SIZE_BORDER_LOWER.width + store.state.width * SIZE_CELL.width) * SVG_SCALE
    })
    return { translateY, rightTranslateX }
  }
})
</script>
