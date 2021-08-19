<template>
  <skin-symbol :translate-x="0" :translate-y="0" name="border-top-left" />
  <skin-symbol :translate-x="horizontalTranslateX" :translate-y="0" name="border-horizontal-top" />
  <skin-symbol :translate-x="rightTranslateX" :translate-y="0" name="border-top-right" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'
import { SIZE_BORDER_TOP, SIZE_CELL, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'

export default defineComponent({
  components: { SkinSymbol },
  setup () {
    const horizontalTranslateX = SIZE_BORDER_TOP.widthLeft * SVG_SCALE
    const rightTranslateX = computed(() => {
      return (SIZE_BORDER_TOP.widthLeft + store.state.width * SIZE_CELL.width) * SVG_SCALE
    })
    return { horizontalTranslateX, rightTranslateX }
  }
})
</script>
