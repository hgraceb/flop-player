<template>
  <base-svg :height="0" :width="0">
    <skin-sprites></skin-sprites>
  </base-svg>
  <base-svg :height="height" :width="width">
    <skin-border-top></skin-border-top>
    <skin-counters></skin-counters>
  </base-svg>
</template>

<script lang="ts">
import BaseSvg from '@/components/BaseSvg.vue'
import SkinSprites from '@/components/skin/SkinSprites.vue'
import SkinBorderTop from '@/components/skin/SkinBorderTop.vue'
import { SIZE_BORDER_TOP, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'
import SkinCounters from '@/components/skin/SkinCounters.vue'

export default {
  components: { SkinCounters, SkinBorderTop, SkinSprites, BaseSvg },
  setup () {
    const width = (SIZE_BORDER_TOP.widthLeft + store.state.width * SIZE_BORDER_TOP.widthHorizontal * 16 + SIZE_BORDER_TOP.widthRight) * SVG_SCALE
    const height = (SIZE_BORDER_TOP.height + 33) * SVG_SCALE
    return { width, height }
  }
}
</script>
