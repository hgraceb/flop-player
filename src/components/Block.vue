<template>
  <div :style="{ backgroundImage: `url(${img})` }" class="block" />
</template>

<script lang="ts">
import { BlockImg } from '@/util/image'

export default {
  props: {
    img: {
      type: String,
      required: true,
      validator: value => BlockImg[value]
    }
  }
}
</script>

<style scoped>
.block {
  width: 16px;
  height: 16px;
  background-size: contain;
}
</style>
