<template>
  <div class="face-normal" :style="{ backgroundImage: `url(${backgroundUrl})` }" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import faceWin from '../assets/face-win.bmp'
import faceNormal from '../assets/face-normal.bmp'

const backgroundUrl = computed(() => {
  return faceWin || faceNormal
})
</script>

<style scoped>
.face-normal {
  width: 26px;
  height: 26px;
}
</style>
