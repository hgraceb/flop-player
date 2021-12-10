<template>
  <screen-center :style="`background: ${maskBackground}`" />
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { store } from '@/store'
import ScreenCenter from '@/components/common/ScreenCenter.vue'

export default defineComponent({
  components: { ScreenCenter },
  setup () {
    // 如果当前页面没有被嵌套进 iframe
    if (self === top) return
    // 隐藏当前窗口
    const classDisplayNone = 'flop-player-display-none'
    // 裁剪元素框外内容对应的全局样式名称
    const classOverflowHidden = 'flop-player-overflow-hidden'
    // 遮罩背景样式
    const maskBackground = ref('')
    // 暴露接口给父窗口
    parent.window.flop = {
      playVideo: (uri: string, anonymous?: boolean) => {
        store.commit('setExit', false)
        store.commit('setAnonymous', anonymous === true)
        store.dispatch('fetchUri', uri)
      },
      setOptions: ({ background }: { background?: string }) => {
        maskBackground.value = background || ''
      }
    }
    // 退出时清理页面
    watch(computed(() => store.state.exit), (exit) => {
      if (exit) {
        self.frameElement.classList.add(classDisplayNone)
        parent.window.document.body.classList.remove(classOverflowHidden)
      } else {
        self.frameElement.classList.remove(classDisplayNone)
        parent.window.document.body.classList.add(classOverflowHidden)
      }
    })
    return { maskBackground }
  }
})
</script>
