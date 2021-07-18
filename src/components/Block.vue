<template>
  <div :style="{ backgroundImage: `url(${img})` }" class="block" />
</template>

<script lang="ts">
import { BlockImg } from '@/util/image'
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    img: {
      type: String,
      required: true,
      validator: (value: BlockImg) => Object.values(BlockImg).includes(value)
    }
  }
})
</script>

<style scoped>
.block {
  width: 16px;
  height: 16px;
  background-size: contain;
}
</style>
