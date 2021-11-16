<template>
  <!-- TODO 如果当前页面被放在 iframe 内则需要添加退出按钮 -->
  <screen-center v-show="loading">
    <a-spin :tip="$t('common.loading')" />
  </screen-center>
  <!-- TODO 解决缩放后没有影响到游戏菜单弹出的窗体内容、 Flex 布局左右边距错误跟随缩放导致有白边的问题 -->
  <div v-show="!loading" style="width: fit-content;margin-left: auto;margin-right: auto">
    <div :style="{transformOrigin: '0 0 0', transform: `scale(${scale})`}" style="display: flex;align-items: flex-end">
      <div style="margin-left: auto">
        <counters />
      </div>
      <div style="margin-right: auto">
        <!-- 使用 v-show 切换显示状态后菜单会出现无法展开的问题，重新渲染即可 -->
        <game-menu :key="!loading" />
        <game />
      </div>
    </div>
    <control-bar style="margin-left: auto;margin-right: auto" />
    <!-- 将文件拖放处理控件放到主布局当中，页面正在加载的时候不对文件拖动事件进行处理 -->
    <file-drag />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import ControlBar from '@/components/ControlBar.vue'
import { store } from '@/store'
import Game from '@/components/Game.vue'
import Counters from '@/components/Counters.vue'
import GameMenu from '@/components/GameMenu.vue'
import ScreenCenter from '@/components/common/ScreenCenter.vue'
import FileDrag from '@/components/FileDrag.vue'

export default defineComponent({
  components: { FileDrag, ScreenCenter, GameMenu, Counters, Game, ControlBar },
  setup () {
    const loading = computed(() => store.state.loading !== false)
    // 用户设置的缩放比例
    const scale = computed(() => store.state.scale)

    onMounted(() => {
      // TODO 删除测试代码和对应的文件（最后不参与打包或者在 README 文件中说明需要手动删除对应的测试录像文件）
      // store.dispatch('fetchUri', 'videos/arbiter_beg.avf')
      // store.dispatch('fetchUri', 'videos/arbiter_int.avf')
      store.dispatch('fetchUri', 'videos/arbiter_exp.avf')
      // store.dispatch('fetchUri', 'videos/Cus_8x30_30mines.avf')
      // store.dispatch('fetchUri', 'videos/Cus_20x20_20mines.avf')
      // store.dispatch('fetchUri', 'videos/Cus_30x8_30mines.avf')
      // store.dispatch('fetchUri', 'videos/double-openging.rawvf')
    })

    return { loading, scale }
  }
})
</script>
