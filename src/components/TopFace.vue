<template>
  <div :style="{ backgroundImage: `url(${faceUrl})` }" class="face-normal" />
</template>

<script lang="ts" setup>
import { computed, defineProps, ref, watch } from 'vue'
import { FaceStatus } from '@/status'
import faceWin from '../assets/face-win.bmp'
import faceLose from '../assets/face-lose.bmp'
import faceNormal from '../assets/face-normal.bmp'
import facePressBlock from '../assets/face-press-block.bmp'
import facePressNormal from '../assets/face-press-normal.bmp'
import { store } from '@/store'

const props = defineProps<{
  faceStatus: FaceStatus
}>()

// 背景图片
const faceUrl = ref<string>(faceNormal)

const setFaceUrl = (faceStatus: FaceStatus) => {
  switch (faceStatus) {
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
}

setFaceUrl(props.faceStatus)

watch(
  () => props.faceStatus,
  (value: FaceStatus) => {
    setFaceUrl(value)
  }
)
</script>

<style scoped>
.face-normal {
  width: 26px;
  height: 26px;
}
</style>
