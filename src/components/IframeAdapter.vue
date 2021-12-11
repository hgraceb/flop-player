<template>
  <screen-center :style="`background: ${maskBackground}`" />
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watch } from 'vue'
import { store } from '@/store'
import ScreenCenter from '@/components/common/ScreenCenter.vue'

export default defineComponent({
  components: { ScreenCenter },
  setup () {
    // 如果当前页面没有被嵌套进 iframe，则显示默认背景样式
    if (self === top) return { maskBackground: '#eee' }
    // 隐藏当前窗口
    const classDisplayNone = 'flop-player-display-none'
    // 裁剪元素框外内容对应的全局样式名称
    const classOverflowHidden = 'flop-player-overflow-hidden'
    // 遮罩背景样式
    const maskBackground = ref('')
    // 退出播放的回调
    const exitListener: Ref<() => void> = ref(() => ({}))
    // 暴露接口给父窗口
    parent.window.flop = {
      playVideo: (uri: string, { anonymous, background, listener }: { anonymous?: boolean, background?: string, listener?: () => void }) => {
        // 设置页面退出状态以显示播放页面
        store.commit('setExit', false)
        // 设置可选参数
        maskBackground.value = background || ''
        exitListener.value = listener || (() => ({}))
        store.commit('setAnonymous', anonymous)
        // 拉取录像并播放
        store.dispatch('fetchUri', uri)
      }
    }
    // 退出时清理页面
    watch(computed(() => store.state.exit), (exit) => {
      if (exit) {
        exitListener.value()
        self.frameElement.classList.add(classDisplayNone)
        parent.window.document.body.classList.remove(classOverflowHidden)
      } else {
        self.frameElement.classList.remove(classDisplayNone)
        parent.window.document.body.classList.add(classOverflowHidden)
      }
    }, {
      // 首次赋值时更新，方便在 iframe 中调试，避免热更新时无法退出游戏页面
      immediate: true
    })
    return { maskBackground }
  }
})
</script>
