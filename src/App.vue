<template>
  <!-- iframe 适配器 -->
  <iframe-adapter />
  <!-- TODO 如果当前页面被放在 iframe 内则需要添加退出按钮 -->
  <screen-center v-show="loading">
    <a-spin :tip="$t('common.loading')" />
  </screen-center>
  <!-- TODO 解决缩放后没有影响到游戏菜单弹出的窗体内容、 Flex 布局左右边距错误跟随缩放导致有白边的问题 -->
  <div v-show="!loading" style="width: fit-content;margin: auto">
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
import IframeAdapter from '@/components/IframeAdapter.vue'

export default defineComponent({
  components: { IframeAdapter, FileDrag, ScreenCenter, GameMenu, Counters, Game, ControlBar },
  setup () {
    const loading = computed(() => store.state.loading !== false)
    // 用户设置的缩放比例
    const scale = computed(() => store.state.scale)

    onMounted(() => {
      // 屏蔽开始拖动事件
      document.ondragstart = () => false
      // 屏蔽左键选择事件
      document.onselectstart = () => false
      // 屏蔽右键菜单事件
      document.oncontextmenu = () => false
    })

    onMounted(() => {
      // TODO 删除测试代码和对应的文件（最后不参与打包或者在 README 文件中说明需要手动删除对应的测试录像文件）
      // store.dispatch('fetchUri', 'videos/avf/arbiter_beg.avf')
      // store.dispatch('fetchUri', 'videos/avf/arbiter_int.avf')
      // store.dispatch('fetchUri', 'videos/avf/arbiter_exp.avf')
      // store.dispatch('fetchUri', 'videos/avf/Cus_8x30_30mines.avf')
      // store.dispatch('fetchUri', 'videos/avf/Cus_20x20_20mines.avf')
      // store.dispatch('fetchUri', 'videos/avf/Cus_30x8_30mines.avf')
      // store.dispatch('fetchUri', 'videos/avf/wasted_clicks_test.avf')
      // store.dispatch('fetchUri', 'videos/mvf/0.96_beta_or_earlier.mvf')
      // store.dispatch('fetchUri', 'videos/mvf/0.97_beta.mvf')
      // store.dispatch('fetchUri', 'videos/mvf/2006_release_1.mvf')
      // store.dispatch('fetchUri', 'videos/mvf/2006_release_2.mvf')
      // store.dispatch('fetchUri', 'videos/mvf/2007_release_1.mvf')
      // store.dispatch('fetchUri', 'videos/mvf/2007_release_2.mvf')
      // store.dispatch('fetchUri', 'videos/rawvf/custom.rawvf')
      // store.dispatch('fetchUri', 'videos/rawvf/nested-openging.rawvf')
      // store.dispatch('fetchUri', 'videos/rmv/beg.rmv')
      // store.dispatch('fetchUri', 'videos/rmv/int.rmv')
      // store.dispatch('fetchUri', 'videos/rmv/exp.rmv')
    })

    return { loading, scale }
  }
})
</script>
