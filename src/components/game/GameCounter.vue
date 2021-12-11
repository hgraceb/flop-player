<template>
  <skin-counter-top :count="countLeftMines" :translate-x="minesCountTranslateX" />
  <skin-face :face-status="faceStatus" />
  <!-- Arbiter 中设置的游戏时间最大值为 999.00，超时自动判负，但是 Minesweeper X 没有对游戏时间做限制，所以一般不设置游戏时间最大值 -->
  <skin-counter-top :count="countTime" :min="0" :translate-x="timeCountTranslateX" />
  <!-- 点击事件遮罩，统一处理点击事件并修改笑脸状态 -->
  <path
    :d="`M 0,0 ${maskWidth},0 ${maskWidth},${maskHeight} 0,${maskHeight}`"
    :transform="`translate(${maskTranslateX} ${maskTranslateY})`"
    fill="rgba(0, 0, 0, 0)"
    @mousedown="maskMouseHandler"
    @mouseenter="maskMouseHandler"
    @mouseleave="maskMouseHandler"
    @mouseup="maskMouseHandler"
  />
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { SQUARE_SIZE, GAME_TOP_MIDDLE, GAME_TOP_UPPER, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'
import SkinCounterTop from '@/components/skin/SkinCounterTop.vue'
import SkinFace from '@/components/skin/SkinFace.vue'
import { ImgFaceType } from '@/util/image'

export default defineComponent({
  components: { SkinFace, SkinCounterTop },
  setup () {
    // 雷数计数器的 X 轴坐标偏移量，3 为雷数计数器与左边框的距离
    const minesCountTranslateX = (GAME_TOP_MIDDLE.widthLeft + 3) * SVG_SCALE
    // 时间计数器的 X 轴坐标偏移量，41 为时间计数器的背景宽度，3 为时间计数器与右边框的距离，Minesweeper X 和 Arbiter 中的值均为 6，看着不爽就改成对称的了
    const timeCountTranslateX = computed(() => {
      return (GAME_TOP_MIDDLE.widthLeft + store.state.width * SQUARE_SIZE - 41 - 3) * SVG_SCALE
    })
    // 当前计数器显示的剩余雷数
    const countLeftMines = computed(() => {
      return store.state.mines - (store.state.gameEvents[store.state.gameEventIndex - 1]?.stats.flags || 0)
    })
    // 当前计数器显示的游戏时间
    const countTime = computed(() => {
      const time = store.getters.getRealTime
      // 当游戏经过的时间为 0 时，计数器显示的时间也为 0，否则需要转换成秒数后 +1
      return time === 0 ? 0 : Math.floor(time) + 1
    })
    // 遮罩的 X 轴坐标偏移量，TODO 修改顶部中间区域宽度的全局配置，这里可以不用 -1
    const maskTranslateX = (GAME_TOP_MIDDLE.widthLeft - 1) * SVG_SCALE
    // 遮罩的 Y 轴坐标偏移量
    const maskTranslateY = GAME_TOP_UPPER.height * SVG_SCALE
    // 遮罩的宽度
    const maskWidth = computed(() => (store.state.width * SQUARE_SIZE + 2) * SVG_SCALE)
    // 遮罩的高度
    const maskHeight = GAME_TOP_MIDDLE.height * SVG_SCALE
    // 笑脸状态
    const faceStatus = ref<ImgFaceType>('face-normal')
    // 鼠标是否处于遮罩范围内
    const mouseEnter = ref(false)
    // 处理遮罩鼠标事件
    const maskMouseHandler = (e: MouseEvent) => {
      switch (e.type) {
        case 'mousedown':
          // 只处理鼠标左键事件
          if (e.button === 0) {
            // 如果鼠标左键事件已经被处理，则阻止事件进一步传播
            e.stopPropagation()
            faceStatus.value = 'face-press-normal'
          }
          break
        case 'mouseup':
          // 根据笑脸状态判断是否需要重开游戏
          if (e.button === 0 && faceStatus.value === 'face-press-normal') {
            e.stopPropagation()
            faceStatus.value = 'face-normal'
            store.commit('upk')
          }
          break
        case 'mouseenter':
          mouseEnter.value = true
          break
        case 'mouseleave':
          mouseEnter.value = false
          break
      }
    }
    // 处理鼠标释放事件
    const mouseup = (e: MouseEvent) => {
      // 如果笑脸处于被点击状态并且当前鼠标不在遮罩范围内
      if (e.button === 0 && faceStatus.value === 'face-press-normal' && !mouseEnter.value) {
        e.stopPropagation()
        faceStatus.value = 'face-normal'
      }
    }
    // 注册和移除监听器，在事件传播阶段就对其进行处理，避免被其他元素处理或者拦截
    onMounted(() => document.addEventListener('mouseup', mouseup, true))
    onUnmounted(() => document.removeEventListener('mouseup', mouseup, true))
    return { countLeftMines, minesCountTranslateX, countTime, timeCountTranslateX, maskTranslateX, maskTranslateY, maskWidth, maskHeight, faceStatus, maskMouseHandler }
  }
})
</script>
