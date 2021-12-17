<template>
  <screen-center :style="{background: maskBackground, zIndex: -9999}" />
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watch } from 'vue'
import { store } from '@/store'
import ScreenCenter from '@/components/common/ScreenCenter.vue'
import { BaseParser } from '@/game/BaseParser'

/** 分享链接配置 */
interface Share {
  // 录像地址
  uri: string,
  // 页面标题
  title?: string
  // 图标地址
  favicon?: string,
  // 路径名称
  pathname?: string
  // 是否匿名显示
  anonymous?: boolean,
  // 页面背景样式
  background?: string,
}

export default defineComponent({
  components: { ScreenCenter },
  setup () {
    // 隐藏当前窗口对应的全局样式名称
    const classDisplayNone = 'flop-player-display-none'
    // 裁剪元素框外内容对应的全局样式名称
    const classOverflowHidden = 'flop-player-overflow-hidden'
    // 遮罩背景样式
    const maskBackground = ref('')
    // 退出播放的回调
    const exitListener: Ref<() => void> = ref(() => ({}))
    // 暴露接口给父窗口
    parent.window.flop = {
      /** 播放录像 */
      playVideo: (uri: string, { anonymous, background, share, listener }: { anonymous?: boolean, background?: string, share?: Share, listener?: () => void }) => {
        // 设置页面退出状态以显示播放页面
        store.commit('setExit', false)
        // 设置可选参数
        maskBackground.value = background || ''
        exitListener.value = listener || (() => ({}))
        store.commit('setAnonymous', anonymous)
        // 拉取录像并播放
        store.dispatch('fetchUri', uri)
        // 如果配置了分享链接参数
        if (share?.uri) {
          // 页面路径
          const path = `${parent.window.location.origin}${share.pathname ? share.pathname : '/'}`
          // 搜索参数
          let params = `?uri=${encodeURIComponent(share.uri)}`
          if (share.title) params = `${params}&title=${encodeURIComponent(share.title)}`
          if (share.favicon) params = `${params}&favicon=${encodeURIComponent(share.favicon)}`
          if (share.anonymous) params = `${params}&anonymous=${encodeURIComponent(share.anonymous)}`
          if (share.background) params = `${params}&background=${encodeURIComponent(share.background)}`
          const shareLink = `${path}${params}`
          // 打印完整分享链接
          console.log(shareLink)
          // 设置分享链接
          store.commit('setShareLink', shareLink)
        }
      },
      /** 解析录像文件 */
      parseFiles: (fileList: FileList | undefined | null, onload: (video: BaseParser) => void, onerror?: (info: string) => void) => {
        onerror = onerror || (() => ({}))
        store.dispatch('parseFiles', { fileList, onload, onerror })
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
