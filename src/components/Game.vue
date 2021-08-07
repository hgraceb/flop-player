<template>
  <div :style="{'width': width + 'px'}" class="background" @dragstart.stop.prevent>
    <div class="flex container-border-top">
      <div class="border-top-left" />
      <div class="border-horizontal-top" />
      <div class="border-top-right" />
    </div>
    <div class="flex">
      <div class="border-vertical-left-upper" />
      <div
        class="flex top space-between"
        @mousedown="faceStatus = 'face-press-normal'"
        @mouseleave="faceStatus = 'face-normal'"
        @mouseup="faceStatus = 'face-normal'"
      >
        <top-counter :count="mines" />
        <top-face :face-status="faceStatus" />
        <top-counter :count="time" :min="0" />
      </div>
      <div class="border-vertical-right-upper" />
    </div>
    <div class="flex">
      <div class="border-middle-left" />
      <div class="border-horizontal-middle" />
      <div class="border-middle-right" />
    </div>
    <div :style="{'height': height + 'px'}" class="flex space-between">
      <div class="border-vertical-left-lower" />
      <cell-board />
      <div class="border-vertical-right-lower" />
    </div>
    <div class="flex">
      <div class="border-bottom-left" />
      <div class="border-horizontal-bottom" />
      <div class="border-bottom-right" />
    </div>
    <div />
    <div />
    <div />
  </div>
  <button type="button" @click="mines = mines < 1111 ? mines + 111 : -999">mines is: {{ mines }}</button>
  <button type="button" @click="time = time < 1111 ? time + 111 : -111">time is: {{ time }}</button>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref } from 'vue'
import TopCounter from './TopCounter.vue'
import TopFace from './TopFace.vue'
import { ImgFaceType } from '@/util/image'
import { store } from '@/store'
import CellBoard from '@/components/CellBoard.vue'

export default defineComponent({
  components: { TopCounter, TopFace, CellBoard },
  setup () {
    const mines = ref(-999)
    const time = ref(-222)
    const width = computed(() => store.state.width * 16 + 24)
    const height = computed(() => store.state.height * 16)
    const faceStatus: Ref<ImgFaceType> = ref('face-normal')

    onMounted(() => {
      // 测试数据
      store.dispatch('fetchVideo', '')
    })
    return { mines, time, width, height, faceStatus }
  }
})
</script>

<!--测试用-->
<style scoped>
button {
  width: 108px;
  text-align: left;
}
</style>

<style scoped>
[class^='border'] {
  background-size: contain;
}

/* 顶部边框容器 */
.container-border-top {
  height: 11px;
  overflow: hidden;
}

/* 顶部左侧边框 */
.border-top-left {
  min-width: 12px;
  height: calc(11px * 2.5);
  background-repeat: space;
  background-image: var(--border-top-left);
}

/* 顶部水平边框 */
.border-horizontal-top {
  width: 100%;
  height: calc(11px * 2.5);
  background-repeat: space;
  background-size: 1px;
  background-image: var(--border-horizontal-top);
}

/* 顶部右侧边框 */
.border-top-right {
  min-width: 12px;
  height: calc(11px * 2.5);
  background-repeat: space;
  background-image: var(--border-top-right);
}

.border-vertical-left-upper {
  min-width: 12px;
  height: 33px;
  background-image: var(--border-vertical-left-upper);
}

.border-vertical-right-upper {
  min-width: 12px;
  height: 33px;
  background-image: var(--border-vertical-right-upper);
}

.border-middle-left {
  min-width: 12px;
  height: 11px;
  background-image: var(--border-middle-left);
}

.border-horizontal-middle {
  width: 100%;
  height: 11px;
  background-image: var(--border-horizontal-middle);
}

.border-middle-right {
  min-width: 12px;
  height: 11px;
  background-image: var(--border-middle-right);
}

.border-vertical-left-lower {
  min-width: 12px;
  height: 100%;
  background-image: var(--border-vertical-left-lower);
}

.border-vertical-right-lower {
  min-width: 12px;
  height: 100%;
  background-image: var(--border-vertical-right-lower);
}

.border-bottom-left {
  min-width: 12px;
  height: 12px;
  background-image: var(--border-bottom-left);
}

.border-horizontal-bottom {
  width: 100%;
  height: 12px;
  background-image: var(--border-horizontal-bottom);
}

.border-bottom-right {
  min-width: 12px;
  height: 12px;
  background-image: var(--border-bottom-right);
}

.top {
  width: 100%;
  padding: 4px 6px 0 4px;
}
</style>
