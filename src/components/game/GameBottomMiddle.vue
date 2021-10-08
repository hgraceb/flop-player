<template>
  <skin-symbol :translate-x="centerTranslateX" :translate-y="translateY" name="game-bottom-middle-center" />
  <g>
    <title>{{ player }}</title>
    <!-- 119.8 为经验值，将页面一直放大后，测试用户选中文本时上下边距是否基本一致 -->
    <text :style="`opacity: ${opacityPlayer}`" :transform="`translate(0 ${translateY})`" class="player-name" x="50%" y="119.8">{{ player }}</text>
  </g>
  <skin-symbol :translate-x="0" :translate-y="translateY" name="game-bottom-middle-left" />
  <skin-symbol :translate-x="rightTranslateX" :translate-y="translateY" name="game-bottom-middle-right" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { CELL_SIDE_LENGTH, GAME_BOTTOM_MIDDLE, GAME_BOTTOM_UPPER, GAME_TOP_LOWER, GAME_TOP_MIDDLE, GAME_TOP_UPPER, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'
import chardet from 'chardet'

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
    // 从原始字节数据解码得到的玩家名称
    const playerDecoded = computed(() => {
      // 自动检测玩家姓名的编码格式，经过测试 Windows-1252 可以兼容目前较多的已有录像数据，默认使用 Windows-1252 编码格式
      // TODO 提供更多的编码格式进行自定义选择，可以分类为自动、常用、中文、英语、日语...
      return new TextDecoder(chardet.detect(store.state.playerArray) || 'Windows-1252').decode(store.state.playerArray).trim()
    })
    // 玩家名称
    const player = computed(() => {
      // 没有玩家姓名信息则默认显示 Anonymous
      return playerDecoded.value.length > 0 ? playerDecoded.value : 'Anonymous'
    })
    // 玩家名称的文本不透明度
    const opacityPlayer = computed(() => {
      // 没有玩家姓名信息则置灰显示
      return playerDecoded.value.length > 0 ? 1 : 0.25
    })
    return { translateY, centerTranslateX, rightTranslateX, player, opacityPlayer }
  }
})
</script>

<style scoped>
.player-name {
  font-size: 100px;
  text-anchor: middle;
}
</style>
