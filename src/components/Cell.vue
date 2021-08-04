<template>
  <div :style="{ backgroundImage: `var(--${img})` }" class="cell"></div>
</template>

<script lang="ts">
import { ImgCellType, isValidImgCell } from '@/util/image'
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    // 背景图片
    img: {
      type: String as PropType<ImgCellType>,
      required: true,
      validator: isValidImgCell
    }
  }
})
</script>

<style scoped>
.cell {
  width: 16px;
  height: 16px;
  background-size: contain;
  background-repeat: no-repeat;
}
</style>
