<template>
  <Game/>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import Game from './components/Game.vue'

export default defineComponent({
  name: 'App',
  components: {
    Game
  }
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
