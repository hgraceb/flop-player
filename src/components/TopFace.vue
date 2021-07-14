<template>
  <div :style="{ backgroundImage: `url(${faceUrl})` }" class="face-normal" />
</template>

<script lang="ts" setup>
import { computed, ComputedRef, defineProps, Ref, ref, watch } from 'vue'
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
const faceUrl: Ref<string> = ref(faceNormal)

const isGameOver: ComputedRef<boolean> = computed(
  () => store.getters.isGameOver
)

const setFaceUrl = (value: FaceStatus) => {
  switch (value) {
    case FaceStatus.Normal:
      faceUrl.value = !isGameOver.value ? faceNormal : faceUrl.value
      break
    case FaceStatus.PressBlock:
      console.log(isGameOver.value)
      faceUrl.value = !isGameOver.value ? facePressBlock : faceUrl.value
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
