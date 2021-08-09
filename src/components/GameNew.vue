<template>
  <base-svg :height="0" :width="0">
    <skin-sprites />
  </base-svg>
  <base-svg :height="height" :width="width">
    <skin-border-top />
    <skin-border-upper />
    <skin-counter-top :count="countLeftMines" :translate-x="minesCountTranslateX" />
    <skin-counter-top :count="countTime" :min="0" :translate-x="timeCountTranslateX" />
    <skin-border-middle />
    <skin-border-lower />
    <skin-border-bottom />
  </base-svg>
</template>

<script lang="ts">
import BaseSvg from '@/components/BaseSvg.vue'
import SkinSprites from '@/components/skin/SkinSprites.vue'
import SkinBorderTop from '@/components/skin/SkinBorderTop.vue'
import { SIZE_BORDER_BOTTOM, SIZE_BORDER_LOWER, SIZE_BORDER_MIDDLE, SIZE_BORDER_TOP, SIZE_BORDER_UPPER, SIZE_CELL, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'
import SkinBorderUpper from '@/components/skin/SkinBorderUpper.vue'
import { computed, defineComponent } from 'vue'
import SkinBorderMiddle from '@/components/skin/SkinBorderMiddle.vue'
import SkinBorderLower from '@/components/skin/SkinBorderLower.vue'
import SkinBorderBottom from '@/components/skin/SkinBorderBottom.vue'
import SkinCounterTop from '@/components/skin/SkinCounterTop.vue'

export default defineComponent({
  components: {
    SkinCounterTop,
    SkinBorderBottom,
    SkinBorderLower,
    SkinBorderMiddle,
    SkinBorderUpper,
    SkinBorderTop,
    SkinSprites,
    BaseSvg
  },
  setup () {
    // SVG 高度信息
    const width = computed(() => {
      return (SIZE_BORDER_TOP.widthLeft + store.state.width * SIZE_BORDER_TOP.widthHorizontal * SIZE_CELL.width + SIZE_BORDER_TOP.widthRight) * SVG_SCALE
    })
    // SVG 宽度信息
    const height = computed(() => {
      return (SIZE_BORDER_TOP.height + SIZE_BORDER_UPPER.height + SIZE_BORDER_MIDDLE.height + store.state.height * SIZE_BORDER_LOWER.height * SIZE_CELL.height + SIZE_BORDER_BOTTOM.height) * SVG_SCALE
    })
    // 雷数计数器的 X 轴坐标偏移量，3 为雷数计数器与左边框的距离
    const minesCountTranslateX = (SIZE_BORDER_UPPER.width + 3) * SVG_SCALE
    // 时间计数器的 X 轴坐标偏移量，41 为时间计数器的背景宽度，3 为时间计数器与有边框的距离，Minesweeper X 和 Arbiter 中的值均为 6，看着不爽就改成对称的了
    const timeCountTranslateX = computed(() => {
      return (SIZE_BORDER_UPPER.width + store.state.width * SIZE_CELL.width - 41 - 3) * SVG_SCALE
    })
    // 当前计数器显示的剩余雷数
    const countLeftMines = computed(() => store.state.leftMines)
    // 当前计数器显示的游戏时间
    const countTime = computed(() => {
      // 当游戏经过的时间为 0 时，计数器显示的时间也为 0，否则需要转换成秒数后 +1
      return store.state.gameElapsedTime === 0 ? 0 : Math.floor(store.state.gameElapsedTime / 1000) + 1
    })
    return { width, height, countLeftMines, minesCountTranslateX, countTime, timeCountTranslateX }
  }
})
</script>
