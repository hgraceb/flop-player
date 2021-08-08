<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <skin-symbol :translate-x="0" :translate-y="0" name="top-counters" />
    <skin-symbol :translate-x="firstTranslateX" :translate-y="countTranslateY" name="count-0" />
    <skin-symbol :translate-x="secondTranslateX" :translate-y="countTranslateY" name="count-0" />
    <skin-symbol :translate-x="thirdTranslateX" :translate-y="countTranslateY" name="count-0" />
  </g>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'
import { SIZE_BORDER_TOP, SVG_SCALE } from '@/game/constants'

export default defineComponent({
  components: { SkinSymbol },
  props: {
    translateX: {
      type: Number,
      required: true
    }
  },
  setup () {
    // 计数器整体的 Y 轴偏移量
    const translateY = (SIZE_BORDER_TOP.height + 4) * SVG_SCALE
    // 计数器的数字的 Y 轴偏移量
    const countTranslateY = 2 * SVG_SCALE
    // 计数器第一个数字的 X 轴偏移量，2 为数字的左边距
    const firstTranslateX = 2 * SVG_SCALE
    // 计数器第二个数字的 X 轴偏移量，11 为单个数字的宽度
    const secondTranslateX = (2 * 2 + 11) * SVG_SCALE
    // 计数器第三个数字的 X 轴偏移量
    const thirdTranslateX = (2 * 3 + 11 * 2) * SVG_SCALE
    return { translateY, countTranslateY, firstTranslateX, secondTranslateX, thirdTranslateX }
  }
})
</script>
