<template>
  <div class="flex cell-board">
    <Cell v-for="(item, index) in state.gameBoard.getCells()" :key="index" :img="item.mine ? 'Flag' : 'Normal'"></Cell>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import Cell from '@/components/Cell.vue'
import { store } from '@/store'

export default defineComponent({
  components: { Cell },
  setup () {
    const state = computed(() => store.state)
    return { state }
  }
})
</script>

<style scoped>
.cell-board {
  flex-wrap: wrap;
}
</style>
