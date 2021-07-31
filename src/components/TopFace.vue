<template>
  <div :style="{ backgroundImage: `var(--${faceImg})` }" class="face-normal" />
</template>

<script lang="ts">
import { defineComponent, PropType, ref, Ref, toRefs, watch } from 'vue'
import { store } from '@/store'
import { ImgFace, TypeImgFace } from '@/util/image'

export default defineComponent({
  props: {
    faceStatus: {
      type: String as PropType<TypeImgFace>,
      required: true,
      validator: (value: TypeImgFace) => Object.values(ImgFace).includes(value)
    }
  },
  setup (props) {
    // 外部设置的背景图片
    const { faceStatus } = toRefs(props)
    // 实际展示的背景图片
    const faceImg: Ref<TypeImgFace> = ref(faceStatus.value)
    // 监听外部设置的背景图片的变化
    watch(faceStatus, () => {
      switch (faceStatus.value) {
        case 'face-normal':
          break
        case 'face-press-cell':
          if (store.state.isGameOver) {
            // 游戏结束后不处理方块的鼠标事件
            return
          }
          break
        case 'face-press-normal':
          break
        case 'face-win':
          break
        case 'face-lose':
          break
      }
      faceImg.value = faceStatus.value
    })

    return { faceImg }
  }
})
</script>

<style scoped>
.face-normal {
  width: 26px;
  height: 26px;
  background-size: 100% 100%;
  background-repeat: round;
}
</style>
