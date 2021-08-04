<template>
  <div :style="{zoom: `${zoom}`}">
    <game />
    <control-bar />
  </div>
  <game />
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import Game from './components/Game.vue'
import ControlBar from '@/components/ControlBar.vue'

export default defineComponent({
  components: { Game, ControlBar },
  setup () {
    // 通过系统或者浏览器设置缩放比例后，Chrome 在部分缩放比例下布局都有问题，特别是系统和浏览器同时进行设置的时候，比如系统设置了 125%，浏览器设置了 25%，Chrome：“...”
    // 为了兼容 Chrome，使用 zoom 样式将页面强制按照 100% 进行显示，Firefox 不支持 zoom 样式，但是 Firefox 怎么缩放都没有问题，可以不用进行处理，Firefox：“小老弟学着点”
    // TODO 提供另外的缩放方法，并将之前多余的适配代码（background-repeat）删除，重新验证下 Firefox 是不是所有比例的缩放都没有显示问题
    const zoom = ref(1 / window.devicePixelRatio)
    const resize = () => {
      console.log(window.devicePixelRatio)
      zoom.value = 1 / window.devicePixelRatio
    }

    onMounted(() => {
      // 注册监听器
      window.addEventListener('resize', resize)
    })

    onUnmounted(() => {
      // 注销监听器
      window.removeEventListener('resize', resize)
    })

    return { zoom }
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
