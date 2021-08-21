<template>
  <skin-symbol :translate-x="centerTranslateX" :translate-y="translateY" name="game-bottom-middle-center" />
  <g>
    <title>{{ player }}</title>
    <!--119.8 为经验值，将页面一直放大后，测试用户选中文本时上下边距是否基本一致-->
    <text :transform="`translate(0 ${translateY})`" class="player-name" x="50%" y="119.8">{{ player }}</text>
  </g>
  <skin-symbol :translate-x="0" :translate-y="translateY" name="game-bottom-middle-left" />
  <skin-symbol :translate-x="rightTranslateX" :translate-y="translateY" name="game-bottom-middle-right" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { CELL_SIDE_LENGTH, GAME_BOTTOM_MIDDLE, GAME_BOTTOM_UPPER, GAME_TOP_LOWER, GAME_TOP_MIDDLE, GAME_TOP_UPPER, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'

export default defineComponent({
  components: { SkinSymbol },
  setup () {
    const translateY = computed(() => {
      return (GAME_TOP_UPPER.height + GAME_TOP_MIDDLE.height + GAME_TOP_LOWER.height + store.state.height * CELL_SIDE_LENGTH + GAME_BOTTOM_UPPER.height) * SVG_SCALE
    })
    // 背景的 X 轴坐标偏移量
    const centerTranslateX = computed(() => {
      return GAME_BOTTOM_MIDDLE.widthLeft * SVG_SCALE
    })
    // 右边框的 X 轴坐标偏移量
    const rightTranslateX = computed(() => {
      return (GAME_BOTTOM_MIDDLE.widthLeft + store.state.width * CELL_SIDE_LENGTH) * SVG_SCALE
    })
    // 玩家名称
    const player = computed(() => store.state.player)
    return { translateY, centerTranslateX, rightTranslateX, player }
  }
})
</script>

<style scoped>
.player-name {
  font-size: 100px;
  text-anchor: middle;
}
</style>
