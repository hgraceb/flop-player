<template id="GameBottomLowerLeft.vue">
  <path d="M0 0v80h10V70h10V60h10V0H0z" fill="white" />
  <path d="M30 0v60H20v10H10v10H0v10h10V80h10V70h10V60h90V0H30z" fill="silver" />
  <path d="M30 60v10H20v10H10v10h110V60H30z" fill="gray" />
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
