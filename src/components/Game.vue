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
import { GAME_TOP_LOWER, GAME_TOP_MIDDLE, GAME_TOP_UPPER, GAME_BOTTOM_UPPER, SIZE_CELL, SVG_SCALE } from '@/game/constants'
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
      return (GAME_TOP_UPPER.widthLeft + store.state.width * SIZE_CELL.width + GAME_TOP_UPPER.widthRight) * SVG_SCALE
    })
    // SVG 宽度信息
    const height = computed(() => {
      return (GAME_TOP_UPPER.height + GAME_TOP_MIDDLE.height + GAME_TOP_LOWER.height + store.state.height * SIZE_CELL.height + GAME_BOTTOM_UPPER.height) * SVG_SCALE
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
