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
    <game-bottom-middle />
    <game-bottom-lower />
    <!-- 将鼠标路径放在最上层显示，超出遮罩部分也正常进行渲染，谁叫你自己鬼画符的 (σ｀д′)σ -->
    <game-mouse-path />
    <!-- 鼠标指针需要显示在最上层，所以需要最后进行渲染 -->
    <game-cursor />
  </base-svg>
</template>

<script lang="ts">
import BaseSvg from '@/components/BaseSvg.vue'
import SkinSprites from '@/components/skin/SkinSprites.vue'
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
import GameMousePath from '@/components/game/GameMousePath.vue'

export default defineComponent({
  components: { GameMousePath, GameBottomLower, GameBottomMiddle, GameBottomUpper, GameCursor, GameTopLower, GameTopMiddle, GameTopUpper, GameMiddle, SkinSprites, BaseSvg },
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
.svg-sprites {
  display: none;
}

.svg-game {
  /* 元素及其子元素的文本不可选中 */
  user-select: none;
  /* 默认的 display 属性值为 inline，会导致底部和其他元素之间有间距 */
  display: block;
}
</style>
