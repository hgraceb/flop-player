<template>
  <template v-if="state.gameBoard.length === state.width * state.height">
    <div v-for="(item, width) in state.width" :key="item" class="flex cell-board">
      <div v-for="(item, height) in state.height" :key="item" class="flex cell-board">
        <Cell :img="state.gameBoard[width + height * state.width]"></Cell>
      </div>
    </div>
  </template>
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
.cell-board {
  flex-wrap: wrap;
}
</style>
