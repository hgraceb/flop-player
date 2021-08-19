<template>
  <base-svg :height="0" :width="0" class="svg-sprites">
    <skin-sprites />
  </base-svg>
  <base-svg :height="height" :width="width" class="svg-game">
    <game-top-upper />
    <game-top-middle />
    <game-top-lower />
    <game-middle />
    <game-bottom-upper />
    <skin-player-info />
    <!-- 鼠标指针需要显示在最上层，所以需要最后进行渲染 -->
    <game-cursor />
  </base-svg>
</template>

<script lang="ts">
import BaseSvg from '@/components/BaseSvg.vue'
import SkinSprites from '@/components/skin/SkinSprites.vue'
import { SIZE_BORDER_BOTTOM, SIZE_BORDER_LOWER, SIZE_BORDER_MIDDLE, SIZE_BORDER_TOP, SIZE_BORDER_UPPER, SIZE_CELL, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'
import { computed, defineComponent } from 'vue'
import SkinPlayerInfo from '@/components/skin/SkinPlayerInfo.vue'
import GameMiddle from '@/components/game/GameMiddle.vue'
import GameTopUpper from '@/components/game/GameTopUpper.vue'
import GameTopMiddle from '@/components/game/GameTopMiddle.vue'
import GameTopLower from '@/components/game/GameTopLower.vue'
import GameCursor from '@/components/game/GameCursor.vue'
import GameBottomUpper from '@/components/game/GameBottomUpper.vue'

export default defineComponent({
  components: {
    GameBottomUpper,
    GameCursor,
    GameTopLower,
    GameTopMiddle,
    GameTopUpper,
    GameMiddle,
    SkinPlayerInfo,
    SkinSprites,
    BaseSvg
  },
  setup () {
    // SVG 高度信息
    const width = computed(() => {
      return (SIZE_BORDER_TOP.widthLeft + store.state.width * SIZE_CELL.width + SIZE_BORDER_TOP.widthRight) * SVG_SCALE
    })
    // SVG 宽度信息
    const height = computed(() => {
      return (SIZE_BORDER_TOP.height + SIZE_BORDER_UPPER.height + SIZE_BORDER_MIDDLE.height + store.state.height * SIZE_BORDER_LOWER.height * SIZE_CELL.height + SIZE_BORDER_BOTTOM.height) * SVG_SCALE
    })
    return { width, height }
  }
})
</script>

<style scoped>
.svg-sprites {
  display: none;
}

.svg-game {
  /* 部分元素在超出边框时也要进行显示，如鼠标指针元素在最右边的时候 */
  overflow: visible;
}
</style>
