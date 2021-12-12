<template>
  <screen-center :style="`background: ${background}`" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ScreenCenter from '@/components/common/ScreenCenter.vue'
import { useTitle, useUrlSearchParams } from '@vueuse/core'
import { store } from '@/store'

export default defineComponent({
  components: { ScreenCenter },
  setup () {
    // 遮罩背景样式
    const params = useUrlSearchParams('history')
    // 打印搜索参数
    console.table(params)
    // 页面标题
    useTitle().value = params.title ? `${params.title}` : 'Flop Player'
    // 遮罩背景样式
    const background = params.background ? params.background : '#eee'
    // 如果有录像参数
    if (params.uri) {
      // 设置是否匿名显示玩家名称
      store.commit('setAnonymous', params.anonymous === 'true')
      // 拉取录像并播放
      store.dispatch('fetchUri', `${params.uri}`)
    }
    return { background }
  }
})
</script>
