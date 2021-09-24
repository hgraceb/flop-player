<template id="GameBottomMiddleRight.vue">
  <path :d="`M0 0L0 ${gameBottomMiddleHeight}L30 ${gameBottomMiddleHeight}L30 0L0 0z`" fill="#e0e0e0" />
  <path :d="`M30 0L30 ${gameBottomMiddleHeight}L90 ${gameBottomMiddleHeight}L90 0L30 0z`" fill="silver" />
  <path :d="`M90 0L90 ${gameBottomMiddleHeight}L120 ${gameBottomMiddleHeight}L120 0L90 0z`" fill="gray" />
</template>

<script lang="ts">

import { computed, defineComponent } from 'vue'
import { store } from '@/store'
import { CELL_SIDE_LENGTH, GAME_BOTTOM_MIDDLE, GAME_TOP_MIDDLE, SVG_SCALE } from '@/game/constants'

export default defineComponent({
  setup () {
    // 游戏棋盘宽度
    const boardWidth = computed(() => {
      return store.state.width * CELL_SIDE_LENGTH * SVG_SCALE
    })
    // 游戏棋盘高度
    const boardHeight = computed(() => {
      return store.state.height * CELL_SIDE_LENGTH * SVG_SCALE
    })
    // 顶部计数器高度
    const countTopHeight = GAME_TOP_MIDDLE.height * SVG_SCALE
    // 游戏底部中间部分的高度信息
    const gameBottomMiddleHeight = GAME_BOTTOM_MIDDLE.height * SVG_SCALE
    return { boardWidth, boardHeight, countTopHeight, gameBottomMiddleHeight }
  }
})
</script>
