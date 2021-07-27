<template>
  <div :style="{ backgroundImage: `url(${url})` }" class="cell"></div>
</template>

<script lang="ts">
import { CellImg } from '@/util/image'
import { computed, defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    // 背景图片
    img: {
      type: String as PropType<keyof typeof CellImg>,
      required: true,
      validator: (value: string) => Object.keys(CellImg).includes(value)
    }
  },
  setup (props) {
    // 背景图片Url
    const url = computed(() => CellImg[props.img])
    return { url }
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
