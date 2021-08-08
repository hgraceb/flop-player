<template>
  <base-svg :height="0" :width="0">
    <skin-sprites />
  </base-svg>
  <base-svg :height="height" :width="width">
    <skin-border-top />
    <skin-border-upper />
    <skin-border-middle />
    <skin-border-lower />
  </base-svg>
</template>

<script lang="ts">
import BaseSvg from '@/components/BaseSvg.vue'
import SkinSprites from '@/components/skin/SkinSprites.vue'
import SkinBorderTop from '@/components/skin/SkinBorderTop.vue'
import {
  SIZE_BORDER_LOWER,
  SIZE_BORDER_MIDDLE,
  SIZE_BORDER_TOP,
  SIZE_BORDER_UPPER,
  SIZE_CELL,
  SVG_SCALE
} from '@/game/constants'
import { store } from '@/store'
import SkinBorderUpper from '@/components/skin/SkinBorderUpper.vue'
import { computed, defineComponent } from 'vue'
import SkinBorderMiddle from '@/components/skin/SkinBorderMiddle.vue'
import SkinBorderLower from '@/components/skin/SkinBorderLower.vue'

export default defineComponent({
  components: { SkinBorderLower, SkinBorderMiddle, SkinBorderUpper, SkinBorderTop, SkinSprites, BaseSvg },
  setup () {
    const width = computed(() => {
      return (SIZE_BORDER_TOP.widthLeft + store.state.width * SIZE_BORDER_TOP.widthHorizontal * SIZE_CELL.width + SIZE_BORDER_TOP.widthRight) * SVG_SCALE
    })
    const height = computed(() => {
      return (SIZE_BORDER_TOP.height + SIZE_BORDER_UPPER.height + SIZE_BORDER_MIDDLE.height + store.state.height * SIZE_BORDER_LOWER.height * SIZE_CELL.height) * SVG_SCALE
    })
    return { width, height }
  }
})
</script>
