<template>
  <div>
    <!-- TODO 缩放时没有影响到游戏菜单弹出的窗体内容 -->
    <div :style="{transformOrigin: '0 0 0', transform: `scale(${scale})`}">
      <div class="game-container">
        <game-menu />
        <game />
      </div>
      <counters />
      <control-bar />
    </div>
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

<style scoped>
.game-container {
  /* 限制游戏宽度 */
  width: min-content;
  /* 不换行 */
  display: inline-block;
}
</style>
