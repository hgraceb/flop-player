<template>
  <div :style="{ backgroundImage: `url(${faceUrl})` }" class="face-normal" />
</template>

<script lang="ts">
import { ref, toRefs, watch } from 'vue'
import { FaceStatus } from '@/status'
import faceNormal from '@/assets/face-normal.bmp'
import { store } from '@/store'
import facePressBlock from '@/assets/face-press-block.bmp'
import facePressNormal from '@/assets/face-press-normal.bmp'
import faceWin from '@/assets/face-win.bmp'
import faceLose from '@/assets/face-lose.bmp'

export default {
  props: {
    faceStatus: {
      type: String,
      required: true,
      validator: value => FaceStatus[value]
    }
  },
  setup (props) {
    // 外部设置的背景图片
    const { faceStatus } = toRefs(props)
    // 实际展示的背景图片
    const faceUrl = ref<string>(faceNormal)
    // 监听外部设置的背景图片的变化
    watch(faceStatus, () => {
      switch (faceStatus.value) {
        case FaceStatus.Normal:
          faceUrl.value = faceNormal
          break
        case FaceStatus.PressBlock:
          if (store.getters.isGameOver) {
            // 游戏结束后不处理方块的鼠标事件
            return
          }
          faceUrl.value = facePressBlock
          break
        case FaceStatus.PressNormal:
          faceUrl.value = facePressNormal
          break
        case FaceStatus.Win:
          faceUrl.value = faceWin
          break
        case FaceStatus.Lose:
          faceUrl.value = faceLose
          break
      }
    })

    return { faceUrl }
  }
}
</script>

<style scoped>
.face-normal {
  width: 26px;
  height: 26px;
  background-size: contain;
}
</style>
