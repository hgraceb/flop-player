<template>
  <skin-symbol :translate-x="translateX" :translate-y="translateY" name="background-top" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { SIZE_BORDER_TOP, SIZE_BORDER_UPPER, SVG_SCALE } from '@/game/constants'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'

export default defineComponent({
  components: { SkinSymbol },
  setup () {
    // 顶部重开区域背景的 X 轴坐标偏移量
    const translateX = computed(() => {
      return SIZE_BORDER_UPPER.width * SVG_SCALE
    })
    // 顶部重开区域背景的 Y 轴坐标偏移量
    const translateY = SIZE_BORDER_TOP.height * SVG_SCALE
    return { translateX, translateY }
  }
})
</script>
