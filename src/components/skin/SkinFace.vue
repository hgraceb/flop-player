<template>
  <skin-symbol
    :name="realFaceStatus"
    :translate-x="translateX"
    :translate-y="translateY"
  />
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'
import { SQUARE_SIZE, GAME_TOP_MIDDLE, GAME_TOP_UPPER, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'
import { ImgFaceType, isValidImgFace } from '@/util/image'

export default defineComponent({
  components: { SkinSymbol },
  props: {
    // 笑脸状态
    faceStatus: {
      type: String as PropType<ImgFaceType>,
      required: true,
      validator: isValidImgFace
    }
  },
  setup (props) {
    // 笑脸的 X 轴坐标偏移量，41 为时间计数器的背景宽度，3 为雷数计数器与左边框的距离，7 为笑脸与雷数计数器的距离，8 为最小的游戏宽度
    const translateX = computed(() => (GAME_TOP_MIDDLE.widthLeft + 41 + 3 + 7 + (store.getters.getDisplayWidth - 8) * SQUARE_SIZE / 2) * SVG_SCALE)
    // 笑脸的 Y 轴坐标偏移量
    const translateY = (GAME_TOP_UPPER.height + 4) * SVG_SCALE
    // 实际展示的笑脸状态
    const realFaceStatus = computed(() => props.faceStatus === 'face-normal' ? store.state.faceStatus : props.faceStatus)
    return { translateX, translateY, realFaceStatus }
  }
})
</script>
