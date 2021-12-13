<template>
  <base-svg :height="0" :width="0" class="svg-sprites">
    <skin-sprites />
  </base-svg>
  <base-svg :height="height" :width="width" class="svg-game">
    <game-background :height="height" :width="width" />
    <game-main />
    <game-counter />
    <game-player-info :height="height" :width="width" />
    <!-- 将边框放在其他区域的上层 -->
    <game-border :height="height" :width="width" />
    <!-- 将鼠标路径放在最上层显示，超出遮罩部分也正常进行渲染，谁叫你自己鬼画符的 (σ｀д′)σ -->
    <game-video-map />
    <!-- 鼠标指针需要显示在最上层，所以需要最后进行渲染 -->
    <game-cursor />
  </base-svg>
</template>

<script lang="ts">
import BaseSvg from '@/components/BaseSvg.vue'
import SkinSprites from '@/components/skin/SkinSprites.vue'
import { GAME_BOTTOM_LOWER, GAME_BOTTOM_MIDDLE, GAME_BOTTOM_UPPER, GAME_TOP_LOWER, GAME_TOP_MIDDLE, GAME_TOP_UPPER, SQUARE_SIZE, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'
import { computed, defineComponent } from 'vue'
import GameCursor from '@/components/game/GameCursor.vue'
import GameVideoMap from '@/components/game/GameVideoMap.vue'
import GameBorder from '@/components/game/GameBorder.vue'
import GameBackground from '@/components/game/GameBackground.vue'
import GamePlayerInfo from '@/components/game/GamePlayerInfo.vue'
import GameMain from '@/components/game/GameMain.vue'
import GameCounter from '@/components/game/GameCounter.vue'

export default defineComponent({
  components: { GameCounter, GameMain, GamePlayerInfo, GameBackground, GameBorder, GameVideoMap, GameCursor, SkinSprites, BaseSvg },
  setup () {
    // SVG 高度信息
    const width = computed(() => (GAME_TOP_UPPER.widthLeft + store.getters.getDisplayWidth * SQUARE_SIZE + GAME_TOP_UPPER.widthRight) * SVG_SCALE)
    // SVG 宽度信息
    const height = computed(() => {
      // 游戏顶部高度
      const heightTop = GAME_TOP_UPPER.height + GAME_TOP_MIDDLE.height + GAME_TOP_LOWER.height
      // 游戏中部高度
      const heightMiddle = store.state.height * SQUARE_SIZE
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
