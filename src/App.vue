<template>
  <game />
  <control-bar />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Game from './components/Game.vue'
import ControlBar from '@/components/ControlBar.vue'

export default defineComponent({
  components: { Game, ControlBar }
})
</script>

<style>
body {
  margin: 0;
}
</style>

<!--测试用-->
<style>
body {
  background-color: #eeeeee;
}
</style>
