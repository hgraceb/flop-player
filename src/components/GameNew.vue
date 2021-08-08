<template>
  <game-svg>
    <cell-number1 translate-x="0" translate-y="0"></cell-number1>
    <cell-number2 translate-x="160" translate-y="0"></cell-number2>
    <cell-number3 translate-x="0" translate-y="160"></cell-number3>
    <cell-number4 translate-x="160" translate-y="160"></cell-number4>
  </game-svg>
</template>

<script lang="ts">
import GameSvg from '@/components/skin/GameSvg.vue'
import CellNumber1 from '@/components/skin/CellNumber1.vue'
import CellNumber2 from '@/components/skin/CellNumber2.vue'
import CellNumber3 from '@/components/skin/CellNumber3.vue'
import CellNumber4 from '@/components/skin/CellNumber4.vue'

export default {
  components: { CellNumber4, CellNumber3, CellNumber2, CellNumber1, GameSvg }
}
</script>
