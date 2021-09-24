<template>
  <base-svg :height="height" :width="width" class="svg-game">
    <game-top-upper />
    <game-top-middle />
    <game-top-lower />
    <game-middle />
    <game-bottom-upper />
    <game-bottom-middle />
    <game-bottom-lower />
    <!-- 鼠标指针需要显示在最上层，所以需要最后进行渲染 -->
    <game-cursor />
  </base-svg>
</template>

<script lang="ts">
import BaseSvg from '@/components/BaseSvg.vue'
import { CELL_SIDE_LENGTH, GAME_BOTTOM_LOWER, GAME_BOTTOM_MIDDLE, GAME_BOTTOM_UPPER, GAME_TOP_LOWER, GAME_TOP_MIDDLE, GAME_TOP_UPPER, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'
import { computed, defineComponent } from 'vue'
import GameMiddle from '@/components/game/GameMiddle.vue'
import GameTopUpper from '@/components/game/GameTopUpper.vue'
import GameTopMiddle from '@/components/game/GameTopMiddle.vue'
import GameTopLower from '@/components/game/GameTopLower.vue'
import GameCursor from '@/components/game/GameCursor.vue'
import GameBottomUpper from '@/components/game/GameBottomUpper.vue'
import GameBottomMiddle from '@/components/game/GameBottomMiddle.vue'
import GameBottomLower from '@/components/game/GameBottomLower.vue'

export default defineComponent({
  components: { GameBottomLower, GameBottomMiddle, GameBottomUpper, GameCursor, GameTopLower, GameTopMiddle, GameTopUpper, GameMiddle, BaseSvg },
  setup () {
    // SVG 高度信息
    const width = computed(() => {
      return (GAME_TOP_UPPER.widthLeft + store.state.width * CELL_SIDE_LENGTH + GAME_TOP_UPPER.widthRight) * SVG_SCALE
    })
    // SVG 宽度信息
    const height = computed(() => {
      // 游戏顶部高度
      const heightTop = GAME_TOP_UPPER.height + GAME_TOP_MIDDLE.height + GAME_TOP_LOWER.height
      // 游戏中部高度
      const heightMiddle = store.state.height * CELL_SIDE_LENGTH
      // 游戏底部高度
      const heightBottom = GAME_BOTTOM_UPPER.height + GAME_BOTTOM_MIDDLE.height + GAME_BOTTOM_LOWER.height
      return (heightTop + heightMiddle + heightBottom) * SVG_SCALE
    })
    return { width, height }
  }
})
</script>

<style scoped>
.svg-game {
  /* 元素及其子元素的文本不可选中 */
  user-select: none;
}
</style>
