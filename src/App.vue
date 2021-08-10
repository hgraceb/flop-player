<template>
  <div :style="{transformOrigin: '0 0 0', transform: `scale(${scale})`}">
    <game />
    <control-bar />
    <div>
      <button :disabled="increaseDisabled" @click="increaseScale">放大</button>
      <button :disabled="decreaseDisabled" @click="decreaseScale">缩小</button>
      <span>{{ scale }}x（实际{{ scale.toFixed(2).substring(0, 4) }}）</span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import ControlBar from '@/components/ControlBar.vue'
import { store } from '@/store'
import { SCALE_ARRAY } from '@/game/constants'
import Game from '@/components/Game.vue'

export default defineComponent({
  components: { Game, ControlBar },
  setup () {
    // 用户设置的缩放比例
    const scale = computed(() => store.state.scale)

    const increaseScale = () => store.commit('setScale', SCALE_ARRAY[SCALE_ARRAY.indexOf(store.state.scale) + 1])
    const decreaseScale = () => store.commit('setScale', SCALE_ARRAY[SCALE_ARRAY.indexOf(store.state.scale) - 1])
    const increaseDisabled = computed(() => store.state.scale >= SCALE_ARRAY[SCALE_ARRAY.length - 1])
    const decreaseDisabled = computed(() => store.state.scale <= SCALE_ARRAY[0])

    onMounted(() => {
      // 测试数据
      store.dispatch('fetchVideo', '')
    })

    return { scale, increaseScale, decreaseScale, increaseDisabled, decreaseDisabled }
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
