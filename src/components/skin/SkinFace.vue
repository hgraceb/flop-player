<template>
  <skin-symbol
    :name="faceStatus"
    :translate-x="translateX"
    :translate-y="translateY"
  />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'
import { CELL_SIDE_LENGTH, GAME_TOP_MIDDLE, GAME_TOP_UPPER, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'

export default defineComponent({
  components: { SkinSymbol },
  setup () {
    // 笑脸的 X 轴坐标偏移量，41 为时间计数器的背景宽度，3 为雷数计数器与左边框的距离，7 为笑脸与雷数计数器的距离，8 为最小的游戏宽度
    const translateX = computed(() => {
      return (GAME_TOP_MIDDLE.widthLeft + 41 + 3 + 7 + (store.state.width - 8) * CELL_SIDE_LENGTH / 2) * SVG_SCALE
    })
    // 笑脸的 Y 轴坐标偏移量
    const translateY = (GAME_TOP_UPPER.height + 4) * SVG_SCALE
    // 笑脸状态
    const faceStatus = computed(() => store.state.faceStatus)
    return { translateX, translateY, faceStatus }
  }
})
</script>
