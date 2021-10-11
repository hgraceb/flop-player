<template>
  <div class="container-control-bar">
    <a-card size="small">
      <a-space :size="4">
        <a-button :title="titleReplay" size="small" @click="replayVideo">
          <template #icon>
            <ReloadOutlined />
          </template>
        </a-button>
        <a-button :title="`${isVideoPaused ? $t('controlBar.play') : $t('controlBar.pause')}`" size="small" @click="toggleVideoPlay">
          <template #icon>
            <CaretRightOutlined v-if="isVideoPaused" />
            <PauseOutlined v-else />
          </template>
        </a-button>
        <a-slider v-model:value="speedSlider" :max="SPEED_ARRAY.length - 1" :tooltipVisible="false" style="width: 80px" />
        <a-button class="text-btn" type="text">{{ speedValue }}x</a-button>
        <a-slider v-model:value="timeSlider" :max="timeMax" :tooltipVisible="false" style="width: 240px" />
        <a-input-number v-model:value="timeValue" :precision="3" size="small" />
      </a-space>
    </a-card>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { store } from '@/store'
import { SPEED_ARRAY } from '@/game/constants'
import { useI18n } from 'vue-i18n'
import { divide, round, times } from 'number-precision'
import { useThrottleFn } from '@vueuse/core'
import { CaretRightOutlined, PauseOutlined, ReloadOutlined } from '@ant-design/icons-vue'

export default defineComponent({
  components: { CaretRightOutlined, PauseOutlined, ReloadOutlined },
  setup () {
    const { t } = useI18n()
    // 重放录像
    const replayVideo = () => store.commit('replayVideo')
    // 切换录像播放状态
    const toggleVideoPlay = () => {
      if (store.state.gameEventIndex >= store.state.gameEvents.length) {
        // 重新播放录像
        store.commit('replayVideo')
      } else if (store.state.gameVideoPaused) {
        // 继续播放录像
        store.commit('playVideo')
      } else {
        // 暂停录像播放
        store.commit('setVideoPaused', true)
      }
    }

    // 重放录像按钮的标题
    const titleReplay = computed(() => t('controlBar.replay'))
    // 录像是否处于暂停状态（录像播放结束也认为处于暂停状态）
    const isVideoPaused = computed(() => {
      return store.state.gameVideoPaused || store.state.gameEventIndex >= store.state.gameEvents.length
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

    return { replayVideo, toggleVideoPlay, titleReplay, isVideoPaused, speedSlider, speedValue, SPEED_ARRAY, timeSlider, timeMax, timeValue }
  }
})
</script>

<style scoped>
.container-control-bar {
  /* 宽度根据内容自适应 */
  width: fit-content;
}

.container-control-bar ::v-deep(.ant-card-body) {
  /* 覆盖卡片的内边距设置，让卡片四周的空白区域保持一致 */
  padding: 0 7px;
}

.text-btn {
  padding-left: 0;
  padding-right: 0;
}
</style>
