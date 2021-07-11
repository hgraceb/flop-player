<template>
  <div :style="{ backgroundImage: `url(${faceUrl})` }" class="face-normal" />
</template>

<script lang="ts" setup>
import { GameStatus, MouseStatus } from '@/status'
import { defineProps, ref, watch } from 'vue'
// import faceWin from '../assets/face-win.bmp'
// import faceLose from '../assets/face-lose.bmp'
import faceNormal from '../assets/face-normal.bmp'
import facePressNormal from '../assets/face-press-normal.bmp'

const props = defineProps<{
  mouseStatus: MouseStatus
  gameStatus: GameStatus
}>()

// 背景图片
const faceUrl = ref(faceNormal)

watch(
  () => props.mouseStatus,
  (value) => {
    if (value === MouseStatus.DOWN) {
      faceUrl.value = facePressNormal
    } else if (value === MouseStatus.UP || value === MouseStatus.LEAVE) {
      faceUrl.value = faceNormal
    }
  }
)
</script>

<style scoped>
.face-normal {
  width: 26px;
  height: 26px;
}
</style>
