<template>
  <base-svg :height="0" :width="0">
    <skin-sprites></skin-sprites>
  </base-svg>
  <base-svg :height="height" :width="width">
    <skin-border-top></skin-border-top>
  </base-svg>
</template>

<script lang="ts">
import BaseSvg from '@/components/BaseSvg.vue'
import SkinSprites from '@/components/skin/SkinSprites.vue'
import SkinBorderTop from '@/components/skin/SkinBorderTop.vue'
import { SIZE_BORDER_TOP } from '@/game/constants'
import { store } from '@/store'

export default {
  components: { SkinBorderTop, SkinSprites, BaseSvg },
  setup () {
    const width = SIZE_BORDER_TOP.widthLeft + store.state.width * SIZE_BORDER_TOP.widthHorizontal * 16 + SIZE_BORDER_TOP.widthRight
    const height = SIZE_BORDER_TOP.height
    return { width, height }
  }
}
</script>
