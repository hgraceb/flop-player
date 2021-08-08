<template>
  <skin-symbol :translate-x="0" :translate-y="translateY" name="border-middle-left"></skin-symbol>
  <g :transform="`translate(${horizontalTranslateX} ${translateY})`">
    <path :d="`M0 0L0 20L${horizontalWidth} 20L${horizontalWidth} 0L0 0z`" fill="#fff" />
    <path :d="`M0 20L0 80L${horizontalWidth} 80L${horizontalWidth} 20L0 20z`" fill="silver" />
    <path :d="`M0 80L0 110L${horizontalWidth} 110L${horizontalWidth} 80L0 80z`" fill="gray" />
  </g>
  <skin-symbol :translate-x="rightTranslateX" :translate-y="translateY" name="border-middle-right"></skin-symbol>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { SIZE_BORDER_COUNTERS, SIZE_BORDER_MIDDLE, SIZE_BORDER_TOP, SIZE_CELL, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'

export default defineComponent({
  components: { SkinSymbol },
  setup () {
    const translateY = (SIZE_BORDER_TOP.height + SIZE_BORDER_COUNTERS.height) * SVG_SCALE
    const horizontalTranslateX = SIZE_BORDER_MIDDLE.widthLeft * SVG_SCALE
    const horizontalWidth = computed(() => {
      return (SIZE_BORDER_MIDDLE.widthHorizontal * store.state.width * SIZE_CELL.width) * SVG_SCALE
    })
    const rightTranslateX = computed(() => {
      return (SIZE_BORDER_MIDDLE.widthLeft + store.state.width * SIZE_CELL.width) * SVG_SCALE
    })
    return { translateY, horizontalTranslateX, horizontalWidth, rightTranslateX }
  }
})
</script>
