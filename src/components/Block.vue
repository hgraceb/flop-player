<template>
  <div :style="{ backgroundImage: `url(${img})` }" class="block" />
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'
import { BlockImg } from '@/util/image'

const props = defineProps<{
  img: BlockImg
}>()
</script>

<style scoped>
.block {
  width: 16px;
  height: 16px;
  background-size: contain;
}
</style>
