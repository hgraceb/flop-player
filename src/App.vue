<template>
  <!-- TODO 解决缩放后没有影响到游戏菜单弹出的窗体内容、 Flex 布局左右边距错误跟随缩放导致有白边的问题 -->
  <div style="width: fit-content;margin-left: auto;margin-right: auto">
    <div :style="{transformOrigin: '0 0 0', transform: `scale(${scale})`}" style="display: flex;align-items: flex-end">
      <div style="margin-left: auto">
        <counters />
      </div>
      <div style="margin-right: auto">
        <game-menu />
        <game />
      </div>
    </div>
    <control-bar style="margin-left: auto;margin-right: auto" />
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
      // TODO 删除测试代码和对应的文件（最后不参与打包或者在 README 文件中说明需要手动删除对应的测试录像文件）
      // store.dispatch('fetchVideo', 'videos/arbiter_beg.rawvf')
      // store.dispatch('fetchVideo', 'videos/arbiter_int.rawvf')
      // store.dispatch('fetchVideo', 'videos/arbiter_exp.rawvf')
      store.dispatch('fetchVideo', 'videos/Cus_20x20_20mines.rawvf')
      // store.dispatch('fetchVideo', 'videos/Cus_8x30_30mines.rawvf')
      // store.dispatch('fetchVideo', 'videos/Cus_30x8_30mines.rawvf')
      // store.dispatch('fetchVideo', 'videos/Cus_16x16_10mines.rawvf')
      // store.dispatch('fetchVideo', 'videos/double-openging.rawvf')
    })

    return { scale }
  }
})
</script>
