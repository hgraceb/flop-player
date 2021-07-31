<template>
  <div :style="{ backgroundImage: `var(--${img})` }" class="cell"></div>
</template>

<script lang="ts">
import { ImgCell, TypeImgCell } from '@/util/image'
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    // 背景图片
    img: {
      type: String as PropType<TypeImgCell>,
      required: true,
      validator: (value: TypeImgCell) => Object.values(ImgCell).includes(value)
    }
  }
})
</script>

<style scoped>
.cell {
  width: 16px;
  height: 16px;
  background-size: 100% 100%;
}
</style>
