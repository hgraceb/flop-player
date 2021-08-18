<template>
  <skin-symbol :translate-x="0" :translate-y="0" name="border-top-left"></skin-symbol>
  <g :transform="`translate(${horizontalTranslateX} 0)`">
    <path :d="`M0 0L0 30L${horizontalWidth} 30L${horizontalWidth} 0L0 0z`" fill="#fff" />
    <path :d="`M0 30L0 90L${horizontalWidth} 90L${horizontalWidth} 30L0 30z`" fill="silver" />
    <path :d="`M0 90L0 110L${horizontalWidth} 110L${horizontalWidth} 90L0 90z`" fill="gray" />
  </g>
  <skin-symbol :translate-x="rightTranslateX" :translate-y="0" name="border-top-right"></skin-symbol>
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
    const horizontalWidth = computed(() => {
      return store.state.width * SIZE_CELL.width * SVG_SCALE
    })
    const rightTranslateX = computed(() => {
      return (SIZE_BORDER_TOP.widthLeft + store.state.width * SIZE_CELL.width) * SVG_SCALE
    })
    return { horizontalTranslateX, horizontalWidth, rightTranslateX }
  }
})
</script>
