<template>
  <game-menu />
  <div :style="{transformOrigin: '0 0 0', transform: `scale(${scale})`}">
    <game />
    <counters />
    <control-bar />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import ControlBar from '@/components/ControlBar.vue'
import { store } from '@/store'
import Game from '@/components/Game.vue'
import Counters from '@/components/Counters.vue'
import GameMenu from '@/components/GameMenu.vue'

export default defineComponent({
  components: { GameMenu, Counters, Game, ControlBar },
  setup () {
    // 用户设置的缩放比例
    const scale = computed(() => store.state.scale)

    onMounted(() => {
      // 测试数据
      store.dispatch('fetchVideo', '')
    })

    return { scale }
  }
})
</script>

<style>
body {
  margin: 0;
}
</style>

<!-- 测试用 -->
<style>
body {
  background-color: #eeeeee;
}
</style>
