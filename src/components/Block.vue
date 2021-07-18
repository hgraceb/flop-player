<template>
  <div
    :style="{ backgroundImage: `url(${BlockImg[type]})` }"
    class="block"
    @mousedown="handleMouse"
    @mouseleave="handleMouse"
    @mouseup="handleMouse"
  />
</template>

<script lang="ts">
import { BlockImg } from '@/util/image'
import { defineComponent, PropType, ref } from 'vue'
import { store } from '@/store'

export default defineComponent({
  props: {
    // 背景图片
    img: {
      type: String as PropType<keyof typeof BlockImg>,
      required: true,
      validator: (value: string) => Object.keys(BlockImg).includes(value)
    }
  },
  setup (props) {
    // 图片类型
    const type = ref(props.img)

    const handleMouse = () => {
      if (store.getters.isGameOver) return
      switch (type.value) {
        case 'Normal':
          type.value = 'Press'
          break
        // case 'Flag':
        //   break
        // case 'Number4':
        //   break
        // case 'Number3':
        //   break
        // case 'Number2':
        //   break
        // case 'Number1':
        //   break
        // case 'Number8':
        //   break
        // case 'FlagWrong':
        //   break
        // case 'Number7':
        //   break
        // case 'Number6':
        //   break
        // case 'Mine':
        //   break
        // case 'Number5':
        //   break
        // case 'MineBomb':
        //   break
        // case 'Question':
        //   break
        // case 'Number0':
        //   break
        // case 'QuestionPress':
        //   break
        case 'Press':
          type.value = 'Normal'
          break
      }
    }
    return { type, BlockImg, handleMouse }
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
