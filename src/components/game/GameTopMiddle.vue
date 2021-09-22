<template>
  <skin-symbol :translate-x="0" :translate-y="translateY" name="border-vertical-left-upper" />
  <skin-symbol :translate-x="centerTranslateX" :translate-y="translateY" name="background-top" />
  <skin-symbol :translate-x="rightTranslateX" :translate-y="translateY" name="border-vertical-right-upper" />
  <skin-counter-top :count="countLeftMines" :translate-x="minesCountTranslateX" />
  <skin-face />
  <!-- Arbiter 中设置的游戏时间最大值为 999.00，超时自动判负，但是 Minesweeper X 没有对游戏时间做限制，所以一般不设置游戏时间最大值 -->
  <skin-counter-top :count="countTime" :min="0" :translate-x="timeCountTranslateX" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { CELL_SIDE_LENGTH, GAME_TOP_MIDDLE, GAME_TOP_UPPER, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'
import SkinCounterTop from '@/components/skin/SkinCounterTop.vue'
import SkinFace from '@/components/skin/SkinFace.vue'

export default defineComponent({
  components: { SkinFace, SkinCounterTop, SkinSymbol },
  setup () {
    const translateY = GAME_TOP_UPPER.height * SVG_SCALE
    // 背景的 X 轴坐标偏移量
    const centerTranslateX = computed(() => {
      return GAME_TOP_MIDDLE.widthLeft * SVG_SCALE
    })
    // 右边框的 X 轴坐标偏移量
    const rightTranslateX = computed(() => {
      return (GAME_TOP_MIDDLE.widthLeft + store.state.width * CELL_SIDE_LENGTH) * SVG_SCALE
    })
    // 雷数计数器的 X 轴坐标偏移量，3 为雷数计数器与左边框的距离
    const minesCountTranslateX = (GAME_TOP_MIDDLE.widthLeft + 3) * SVG_SCALE
    // 时间计数器的 X 轴坐标偏移量，41 为时间计数器的背景宽度，3 为时间计数器与右边框的距离，Minesweeper X 和 Arbiter 中的值均为 6，看着不爽就改成对称的了
    const timeCountTranslateX = computed(() => {
      return (GAME_TOP_MIDDLE.widthLeft + store.state.width * CELL_SIDE_LENGTH - 41 - 3) * SVG_SCALE
    })
    // 当前计数器显示的剩余雷数
    const countLeftMines = computed(() => {
      return store.state.mines - (store.state.gameEvents[store.state.gameEventIndex - 1]?.stats.flags || 0)
    })
    // 当前计数器显示的游戏时间
    const countTime = computed(() => {
      const time = Math.min(store.state.gameEvents[store.state.gameEvents.length - 1]?.time || 0, store.state.gameElapsedTime) / 1000
      // 当游戏经过的时间为 0 时，计数器显示的时间也为 0，否则需要转换成秒数后 +1
      return time === 0 ? 0 : Math.floor(time) + 1
    })
    return { translateY, centerTranslateX, rightTranslateX, countLeftMines, minesCountTranslateX, countTime, timeCountTranslateX }
  }
})
</script>
