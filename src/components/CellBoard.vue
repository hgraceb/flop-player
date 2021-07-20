<template>
  <div class="flex cell-board">
    <template v-if="state.gameBoard">
      <Cell v-for="index in state.width * state.height" :key="index" :img="'Normal'"></Cell>
    </template>
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
