<template>
  <!-- 分享页面适配器 -->
  <share-adapter v-if="topmost" />
  <!-- iframe 适配器 -->
  <iframe-adapter v-else />
  <screen-center v-show="loading">
    <a-spin :tip="$t('common.loading')" />
  </screen-center>
  <div v-show="!loading" style="width: fit-content;margin: auto">
    <div style="display: flex;align-items: flex-end">
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
import ShareAdapter from '@/components/ShareAdapter.vue'

export default defineComponent({
  components: { ShareAdapter, IframeAdapter, FileDrag, ScreenCenter, GameMenu, Counters, Game, ControlBar },
  setup () {
    // 页面加载状态
    const loading = computed(() => store.state.loading)
    // 当前页面是否是最上层页面
    const topmost = self === top

    onMounted(() => {
      // 屏蔽开始拖动事件
      document.ondragstart = () => false
      // 屏蔽左键选择事件
      document.onselectstart = () => false
      // 屏蔽右键菜单事件
      document.oncontextmenu = () => false
    })

    return { loading, topmost }
  }
})
</script>
