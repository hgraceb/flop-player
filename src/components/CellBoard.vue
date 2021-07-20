<template>
  <div class="flex">
    <template v-if="gameBoard">
      <Cell v-for="index in [1, 2, 3]" :key="index" :img="'Normal'"></Cell>
      <Cell v-for="index in [1, 2, 3]" :key="index" :img="'Flag'"></Cell>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { GameBoard } from '@/game'
import Cell from '@/components/Cell.vue'

export default defineComponent({
  components: { Cell },
  props: {
    gameBoard: {
      type: Object as PropType<GameBoard>,
      required: false
    }
  },
  setup (props) {
    return { props }
  }
})
</script>
