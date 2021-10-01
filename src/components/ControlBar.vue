<template>
  <div>
    <a-space>
      <a-button :title="titleReplay" size="small" @click="replayVideo">{{ titleReplay }}</a-button>
      <a-button :title="titleTogglePlay" size="small" @click="toggleVideoPlay">{{ titleTogglePlay }}</a-button>
    </a-space>
    <br />
    <a-space>
      <a-slider v-model:value="speedSlider" :max="SPEED_ARRAY.length - 1" :tooltipVisible="false" class="slider" />
      <a-button class="btn-text" type="text">{{ speedValue }}x</a-button>
    </a-space>
    <br />
    <a-space>
      <a-slider v-model:value="timeSlider" :max="timeMax" :tooltipVisible="false" class="slider" />
      <a-input-number v-model:value="timeValue" :precision="3" size="small" />
    </a-space>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { store } from '@/store'
import { SPEED_ARRAY } from '@/game/constants'
import { useI18n } from 'vue-i18n'
import { divide, round, times } from 'number-precision'
import { useThrottleFn } from '@vueuse/core'

export default defineComponent({
  setup () {
    const { t } = useI18n()
    // 重放录像
    const replayVideo = () => store.commit('replayVideo')
    // 切换录像播放状态
    const toggleVideoPlay = () => {
      return store.state.gameEventIndex >= store.state.gameEvents.length ? store.commit('replayVideo') : store.commit('pauseVideo')
    }

    // 重放录像按钮的标题
    const titleReplay = computed(() => t('controlBar.replay'))
    // 切换录像播放状态按钮的标题
    const titleTogglePlay = computed(() => {
      if (store.state.gameEventIndex >= store.state.gameEvents.length) {
        return t('controlBar.replay')
      }
      return store.state.gameVideoPaused ? t('controlBar.play') : t('controlBar.pause')
    })

    // 当前录像实际速度，类型为 number
    const speedSlider = computed({
      get: () => {
        return SPEED_ARRAY.indexOf(store.state.gameSpeed)
      },
      set: (value: number) => {
        store.commit('setGameSpeed', SPEED_ARRAY[value])
      }
    })
    // 当前录像播放速度，显示为三位数字和一位小数点组成的字符串
    const speedValue = computed(() => {
      return round(SPEED_ARRAY[speedSlider.value], 2).toFixed(2).substring(0, 4)
    })

    // 游戏时间进度条的最大值，以最后一个游戏事件的时间作为标准，0.001 秒为一个单位长度
    const timeMax = computed(() => {
      return store.state.gameEvents[store.state.gameEvents.length - 1]?.time || 0
    })
    // 游戏时间进度条当前值，通过当前游戏经过的时间计算得到
    const timeSlider = computed({
      get: () => {
        // 限制最大值
        return Math.min(store.state.gameElapsedTime, timeMax.value)
      },
      // 函数节流，避免调用次数过多造成资源浪费和控制条拖动卡顿，20ms 是经过实际测试后定的经验值，其他值要么拖快容易卡，要么拖慢容易卡
      set: useThrottleFn((value: number) => {
        // 判断数字是否合法
        if (value >= 0 && value <= timeMax.value) {
          store.commit('setGameElapsedTime', value)
        }
      }, 20)
    })
    // 当前游戏时间，精确到三位小数
    const timeValue = computed({
      get: () => {
        // 通过 precision 属性控制小数位数，数字输入框组件内部会调用 toFixed(precision)，此处直接调用 toFixed(precision) 可能不会生效
        return divide(timeSlider.value, 1000)
      },
      set: (value: number | string) => {
        // 如果输入值是合法的数字
        if (typeof value === 'number') {
          // 最多只计算后三位小数
          timeSlider.value = Math.floor(times(value, 1000))
        }
      }
    })

    return { replayVideo, toggleVideoPlay, titleReplay, titleTogglePlay, speedSlider, speedValue, SPEED_ARRAY, timeSlider, timeMax, timeValue }
  }
})
</script>

<style scoped>
.slider {
  width: 300px;
}

.btn-text {
  padding-left: 0;
  padding-right: 0;
}
</style>
