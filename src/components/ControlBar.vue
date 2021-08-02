<template>
  <div>
    <button>重放</button>
    <button>暂停</button>
    <div>
      <input
        v-model="speed"
        :max="speedArr.length - 1"
        type="range"
      >
      <span>{{ speedArr[speed].toFixed(2).substring(0, 4) }}x</span>
    </div>
    <div>
      <input
        v-model="time"
        :max="timeMax"
        type="range"
      >
      <span>{{ time }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { store } from '@/store'
import { speedArr } from '@/game/contants'

export default defineComponent({
  setup () {
    const speed = computed({
      get: () => {
        return speedArr.indexOf(store.state.gameSpeed)
      },
      set: (value: number) => {
        store.commit('setGameSpeed', speedArr[parseInt(`${value}`)])
      }
    })
    // TODO 完善时间进度条，将时间进度条改为按照时间均分
    const time = computed(() => store.state.gameEventIndex)
    const timeMax = computed(() => store.state.gameEvents.length)

    return { speed, speedArr, time, timeMax }
  }
})
</script>
