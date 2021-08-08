<template>
  <base-svg :height="0" :width="0">
    <skin-sprites />
  </base-svg>
  <base-svg :height="height" :width="width">
    <skin-border-top />
    <skin-counters />
    <skin-border-middle />
  </base-svg>
</template>

<script lang="ts">
import BaseSvg from '@/components/BaseSvg.vue'
import SkinSprites from '@/components/skin/SkinSprites.vue'
import SkinBorderTop from '@/components/skin/SkinBorderTop.vue'
import { SIZE_BORDER_COUNTERS, SIZE_BORDER_MIDDLE, SIZE_BORDER_TOP, SIZE_CELL, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'
import SkinCounters from '@/components/skin/SkinCounters.vue'
import { computed } from 'vue'
import SkinBorderMiddle from '@/components/skin/SkinBorderMiddle.vue'

export default {
  components: { SkinBorderMiddle, SkinCounters, SkinBorderTop, SkinSprites, BaseSvg },
  setup () {
    const width = computed(() => {
      return (SIZE_BORDER_TOP.widthLeft + store.state.width * SIZE_BORDER_TOP.widthHorizontal * SIZE_CELL.width + SIZE_BORDER_TOP.widthRight) * SVG_SCALE
    })
    const height = (SIZE_BORDER_TOP.height + SIZE_BORDER_COUNTERS.height + SIZE_BORDER_MIDDLE.height) * SVG_SCALE
    return { width, height }
  }
}
</script>
