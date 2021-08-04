<template>
  <div :style="{zoom: `${zoom}`, transformOrigin: '0 0 0', transform: `scale(${scale})`}">
    <game />
    <control-bar />
    <button :disabled="increaseDisabled" @click="increaseScale">放大</button>
    <button :disabled="decreaseDisabled" @click="decreaseScale">缩小</button>
    <span>{{ scale.toFixed(2).substring(0, 4) }}x</span>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'
import Game from './components/Game.vue'
import ControlBar from '@/components/ControlBar.vue'
import { store } from '@/store'
import { SCALE_ARRAY } from '@/game/constants'

export default defineComponent({
  components: { Game, ControlBar },
  setup () {
    // 通过系统或者浏览器设置缩放比例后，Chrome 在部分缩放比例下布局都有问题，特别是系统和浏览器同时进行设置的时候，比如系统设置了 125%，浏览器设置了 25%，Chrome：“...”
    // 为了兼容 Chrome，使用 zoom 样式将页面强制按照 100% 进行显示，Firefox 不支持 zoom 样式，但是 Firefox 怎么缩放都没有问题，可以不用进行处理，Firefox：“小老弟学着点”
    const zoom = ref(1 / window.devicePixelRatio)
    const resize = () => {
      zoom.value = 1 / window.devicePixelRatio
    }

    // 为 Chrome 提供另外的缩放方法
    const scale = computed(() => store.state.scale)

    const increaseScale = () => store.commit('setScale', SCALE_ARRAY[SCALE_ARRAY.indexOf(store.state.scale) + 1])
    const decreaseScale = () => store.commit('setScale', SCALE_ARRAY[SCALE_ARRAY.indexOf(store.state.scale) - 1])
    const increaseDisabled = computed(() => store.state.scale >= SCALE_ARRAY[SCALE_ARRAY.length - 1])
    const decreaseDisabled = computed(() => store.state.scale <= SCALE_ARRAY[0])

    onMounted(() => {
      // 注册监听器
      window.addEventListener('resize', resize)
    })

    onUnmounted(() => {
      // 注销监听器
      window.removeEventListener('resize', resize)
    })

    return { zoom, scale, increaseScale, decreaseScale, increaseDisabled, decreaseDisabled }
  }
})
</script>

<style>
body {
  margin: 0;
}
</style>

<!--测试用-->
<style>
body {
  background-color: #eeeeee;
}
</style>
