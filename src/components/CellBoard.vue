<template>
  <div v-for="item in state.width" :key="item" class="flex cell-board">
    <div v-for="item in state.height" :key="item" class="flex cell-board">
      <Cell :img="'Normal'"></Cell>
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
.cell-board {
  flex-wrap: wrap;
}
</style>
