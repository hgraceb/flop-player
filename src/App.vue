<template>
  <!-- TODO 缩放时没有影响到游戏菜单弹出的窗体内容 -->
  <a-layout :style="{transformOrigin: '0 0 0', transform: `scale(${scale})`}" class="layout-background">
    <a-layout-sider class="layout-slider-counters layout-background">
      <counters />
    </a-layout-sider>
    <a-layout class="layout-background">
      <a-layout-content>
        <game-menu />
        <game />
      </a-layout-content>
      <a-layout-content>
        <control-bar />
      </a-layout-content>
    </a-layout>
  </a-layout>
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
      // TODO 删除测试代码和对应的文件（最后不参与打包或者在 README 文件中说明）
      store.dispatch('fetchVideo', 'videos/arbiter_int.rawvf')
    })

    return { scale }
  }
})
</script>

<style scoped>
/* 布局背景 */
.layout-background {
  /* 清除布局默认背景颜色 */
  background-color: transparent;
}

/* 侧边栏计数器布局，清除原有侧边栏样式 */
.layout-slider-counters {
  min-width: 0 !important;
  max-width: none !important;
  width: max-content !important;
  flex-basis: auto !important;
}
</style>
