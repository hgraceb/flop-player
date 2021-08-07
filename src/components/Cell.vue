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
  height: 16px;
  /* 部分缩放比例下有白边，使用 background-repeat 也无法解决，这里直接设置最小宽度，外部需要多余的部分隐藏掉 */
  min-width: calc(16px * 2);
  background-size: contain;
}
</style>
