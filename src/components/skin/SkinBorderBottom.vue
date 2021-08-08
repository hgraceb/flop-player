<template>
  <skin-symbol :translate-x="0" :translate-y="translateY" name="border-bottom-left"></skin-symbol>
  <g :transform="`translate(${horizontalTranslateX} ${translateY})`">
    <path :d="`M0 0L0 30L${horizontalWidth} 30L${horizontalWidth} 0L0 0z`" fill="#fff" />
    <path :d="`M0 30L0 90L${horizontalWidth} 90L${horizontalWidth} 30L0 30z`" fill="silver" />
    <path :d="`M0 90L0 120L${horizontalWidth} 120L${horizontalWidth} 90L0 90z`" fill="gray" />
  </g>
  <skin-symbol :translate-x="rightTranslateX" :translate-y="translateY" name="border-bottom-right"></skin-symbol>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'
import {
  SIZE_BORDER_BOTTOM,
  SIZE_BORDER_LOWER,
  SIZE_BORDER_MIDDLE,
  SIZE_BORDER_TOP,
  SIZE_BORDER_UPPER,
  SIZE_CELL,
  SVG_SCALE
} from '@/game/constants'
import { store } from '@/store'

export default defineComponent({
  components: { SkinSymbol },
  setup () {
    const translateY = computed(() => {
      return (SIZE_BORDER_TOP.height + SIZE_BORDER_UPPER.height + SIZE_BORDER_MIDDLE.height + SIZE_BORDER_LOWER.height * store.state.height * SIZE_CELL.height) * SVG_SCALE
    })
    const horizontalTranslateX = SIZE_BORDER_BOTTOM.widthLeft * SVG_SCALE
    const horizontalWidth = computed(() => {
      return (SIZE_BORDER_BOTTOM.widthHorizontal * store.state.width * SIZE_CELL.width) * SVG_SCALE
    })
    const rightTranslateX = computed(() => {
      return (SIZE_BORDER_BOTTOM.widthLeft + store.state.width * SIZE_BORDER_BOTTOM.widthHorizontal * SIZE_CELL.width) * SVG_SCALE
    })
    return { translateY, horizontalTranslateX, horizontalWidth, rightTranslateX }
  }
})
</script>
