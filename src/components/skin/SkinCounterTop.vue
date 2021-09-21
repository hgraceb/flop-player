<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <skin-symbol :translate-x="0" :translate-y="0" name="top-counters" />
    <skin-symbol :name="`count-${hun}`" :translate-x="firstTranslateX" :translate-y="countTranslateY" />
    <skin-symbol :name="`count-${ten}`" :translate-x="secondTranslateX" :translate-y="countTranslateY" />
    <skin-symbol :name="`count-${one}`" :translate-x="thirdTranslateX" :translate-y="countTranslateY" />
  </g>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'
import { GAME_TOP_UPPER, SVG_SCALE } from '@/game/constants'

export default defineComponent({
  components: { SkinSymbol },
  props: {
    // 计数器整体的 X 轴坐标偏移量
    translateX: {
      type: Number,
      required: true
    },
    // 需要显示的值
    count: {
      type: Number,
      required: true
    },
    // 最小值
    min: {
      type: Number,
      required: false,
      default: Number.MIN_SAFE_INTEGER
    },
    // 最大值
    max: {
      type: Number,
      required: false,
      default: Number.MAX_SAFE_INTEGER
    }
  },
  setup (props) {
    // 计数器整体的 Y 轴坐标偏移量
    const translateY = (GAME_TOP_UPPER.height + 4) * SVG_SCALE
    // 计数器的数字的 Y 轴坐标偏移量
    const countTranslateY = 2 * SVG_SCALE
    // 计数器第一个数字的 X 轴坐标偏移量，2 为数字的左边距
    const firstTranslateX = 2 * SVG_SCALE
    // 计数器第二个数字的 X 轴坐标偏移量，11 为单个数字的宽度
    const secondTranslateX = (2 * 2 + 11) * SVG_SCALE
    // 计数器第三个数字的 X 轴坐标偏移量
    const thirdTranslateX = (2 * 3 + 11 * 2) * SVG_SCALE

    // 实际显示的值，最大只显示999
    const value = computed((): number => {
      return Math.min(Math.max(props.count, props.min), Math.floor(props.max))
    })

    // 百位数的值
    const hun = computed((): number | string => {
      // 显示的值为负数时，最多只显示两位数字，百位数显示负号
      if (value.value < 0) {
        return 'minus'
      }
      return Math.floor(Math.abs(value.value) / 100) % 10
    })
    // 十位数的值
    const ten = computed((): number => {
      return Math.floor(Math.abs(value.value) / 10) % 10
    })
    // 个位数的值
    const one = computed((): number => {
      return Math.abs(value.value) % 10
    })

    return { translateY, countTranslateY, firstTranslateX, secondTranslateX, thirdTranslateX, hun, ten, one }
  }
})
</script>
