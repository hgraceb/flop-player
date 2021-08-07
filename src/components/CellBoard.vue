<template>
  <div v-if="state.gameBoard.length === state.width * state.height" class="flex container-cell-board">
    <div v-for="(item, width) in state.width" :key="item" class="flex cell-board">
      <cell v-for="(item, height) in state.height" :key="item" :img="state.gameBoard[width + height * state.width]" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import Cell from '@/components/Cell.vue'
import { store } from '@/store'

export default defineComponent({
  components: { Cell },
  setup () {
    return { state: computed(() => store.state) }
  }
})
</script>

<style scoped>
.container-cell-board {
  /* 在最外层的容器设置 hidden，隐藏多余的部分，在内部使用的话部分缩放比例（如：10.2）还是会有白边 */
  overflow: hidden;
}

.cell-board {
  /* 设置宽度，避免布局错位 */
  width: 16px;
  flex-wrap: wrap;
}
</style>
