<template>
  <screen-center :style="{background: maskBackground, zIndex: -9999}" />
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watch } from 'vue'
import { store } from '@/store'
import ScreenCenter from '@/components/common/ScreenCenter.vue'
import { BaseParser } from '@/game/BaseParser'
import { Share } from '@/game/constants'

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
    // 设置分享链接
    const setShareLink = (share?: Share) => {
      // 如果没有配置分享链接参数
      if (!share?.uri) return
      // 页面路径
      const path = `${parent.window.location.origin}${share.pathname ? share.pathname : '/'}`
      try {
        // 使用 base-64 编码对分享参数进行简单加密，可以一定程度避免参数被篡改，如：anonymous
        // 也可以避免部分浏览器在处理链接时会将多个 “.” 合并为一个 “.” 的问题，如：Quark 5.3.8.193 (Android)
        // 先使用 encodeURIComponent 对 JSON 字符串进行处理，避免中文和其他特殊字符无法正常编码，再使用 unescape 缩短字符串长度
        const params = `?share=${encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(share)))))}`
        // 完整分享链接
        const shareLink = `${path}${params}`
        // 打印完整分享链接
        console.log(shareLink)
        // 设置分享链接
        store.commit('setShareLink', shareLink)
      } catch (e) {
        console.error(e)
      }
    }
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
        // 设置分享链接
        setShareLink(share)
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
    // 通知父窗口当前页面已经加载完成
    if (parent.flop.onload) parent.flop.onload()
    return { maskBackground }
  }
})
</script>
