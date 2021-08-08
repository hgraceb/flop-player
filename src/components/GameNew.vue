<template>
  <base-svg :height="0" :width="0">
    <skin-sprites></skin-sprites>
  </base-svg>
  <base-svg :height="200" :width="200">
    <skin-symbol :translate-x="0" :translate-y="0" name="cell-number-1"></skin-symbol>
    <skin-symbol :translate-x="160" :translate-y="0" name="cell-number-2"></skin-symbol>
    <skin-symbol :translate-x="0" :translate-y="160" name="cell-number-3"></skin-symbol>
    <skin-symbol :translate-x="160" :translate-y="160" name="cell-number-4"></skin-symbol>
  </base-svg>
</template>

<script lang="ts">
import BaseSvg from '@/components/BaseSvg.vue'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'
import SkinSprites from '@/components/skin/SkinSprites.vue'

export default {
  components: { SkinSprites, SkinSymbol, BaseSvg }
}
</script>
