<template>
  <div>
    <button @click="replayVideo">重放</button>
    <button @click="pauseVideo">暂停</button>
    <div>
      <input
        v-model="speed"
        :max="SPEED_ARRAY.length - 1"
        type="range"
      >
      <span>{{ SPEED_ARRAY[speed].toFixed(2).substring(0, 4) }}x</span>
    </div>
    <div>
      <input
        v-model="timeSlider"
        :max="timeMax"
        type="range"
      >
      <span>{{ timeValue }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { store } from '@/store'
import { SPEED_ARRAY } from '@/game/constants'

export default defineComponent({
  setup () {
    const replayVideo = () => store.commit('replayVideo')
    const pauseVideo = () => store.commit('pauseVideo')

    const speed = computed({
      get: () => {
        return SPEED_ARRAY.indexOf(store.state.gameSpeed)
      },
      set: (value: number) => {
        store.commit('setGameSpeed', SPEED_ARRAY[parseInt(`${value}`)])
      }
    })

    // 游戏时间进度条的最大值，以最后一个游戏事件的时间作为标准，0.01 秒为一个单位长度
    const timeMax = computed(() => {
      return store.state.gameEvents[store.state.gameEvents.length - 1]?.time / 10 || 0
    })
    // 游戏时间进度条当前值，通过当前游戏经过的时间计算得到
    const timeSlider = computed({
      get: () => {
        return store.state.gameElapsedTime / 10
      },
      set: (value: number) => {
        store.commit('setGameElapsedTime', parseInt(`${value}`) * 10)
      }
    })
    // 当前游戏时间，精确到两位小数
    const timeValue = computed(() => {
      // TODO 确认最后一个游戏事件是否可以正常预览和播放
      return (Math.min(timeMax.value, timeSlider.value) / 100).toFixed(2)
    })

    return { replayVideo, pauseVideo, speed, SPEED_ARRAY, timeSlider, timeMax, timeValue }
  }
})
</script>
