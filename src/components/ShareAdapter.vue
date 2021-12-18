<template>
  <screen-center :style="{background: background, zIndex: -9999}" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ScreenCenter from '@/components/common/ScreenCenter.vue'
import { useFavicon, useTitle, useUrlSearchParams } from '@vueuse/core'
import { store } from '@/store'
import { Share } from '@/game/constants'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: { ScreenCenter },
  setup () {
    const { t } = useI18n()
    // 获取搜索参数
    const params = useUrlSearchParams('history')
    // 打印搜索参数
    console.table(params)
    // 分享参数
    let share: Share = {}
    try {
      // 解析分享参数
      share = JSON.parse(atob(`${params.share}`))
      console.table(share)
    } catch (e) {
      console.error(e)
      message.error(t('error.shareParams', [e.message]))
    }
    // 页面标题
    useTitle().value = share.title ? `${share.title}` : 'Flop Player'
    // 页面图标
    useFavicon().value = share.favicon ? `${share.favicon}` : useFavicon().value
    // 遮罩背景样式
    const background = share.background ? share.background : '#eee'
    // 如果有录像参数
    if (share.uri) {
      // 设置是否匿名显示玩家名称
      store.commit('setAnonymous', share.anonymous === true)
      // 拉取录像并播放
      store.dispatch('fetchUri', `${share.uri}`)
    }
    return { background }
  }
})
</script>
