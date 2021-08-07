<template>
  <div :style="{'width': width + 'px'}" class="background" @dragstart.stop.prevent>
    <div class="flex container-border-top">
      <div class="border-top-left" />
      <div class="border-top-horizontal" />
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
    <div class="flex container-border-middle">
      <div class="border-middle-left" />
      <div class="border-middle-horizontal" />
      <div class="border-middle-right" />
    </div>
    <div :style="{'height': height + 'px'}" class="flex space-between">
      <div class="border-vertical-left-lower" />
      <cell-board />
      <div class="border-vertical-right-lower" />
    </div>
    <div class="flex container-border-bottom ">
      <div class="border-bottom-left" />
      <div class="border-horizontal-bottom" />
      <div class="border-bottom-right" />
    </div>
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

/* 顶部和中部的边框容器 */
.container-border-top, .container-border-middle {
  /* 设置可见高度 */
  height: 11px;
  /* 隐藏可见高度外的元素 */
  overflow: hidden;
}

/* 顶部边框适配特殊缩放比例，Chrome 部分特殊缩放倍数下会有白边，如：10.5、10.7 等 */
/* 将图片以两倍高度重复显示后，Chrome 取上面的部分进行显示，Firefox 取下面的部分进行显示 */
[class^='border-top'] {
  height: calc(11px * 2);
  margin-top: -11px;
  background-repeat: repeat;
}

/* 顶部左侧边框 */
.border-top-left {
  min-width: 12px;
  background-image: var(--border-top-left);
}

/* 顶部水平边框 */
.border-top-horizontal {
  width: 100%;
  background-size: 1px;
  background-image: var(--border-top-horizontal);
}

/* 顶部右侧边框 */
.border-top-right {
  min-width: 12px;
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

/* 中部边框适配特殊缩放比例，Chrome 部分特殊缩放倍数下会有白边，如：10.1、10.3 等 */
/* 将图片以两倍高度重复显示后，取下面的部分进行展示即可，不要问我为什么这里 Chrome 不用取上面的部分，ಥ_ಥ 因为我也不知道，都是用肝试出来的 */
[class^='border-middle'] {
  height: calc(11px * 2);
  background-repeat: repeat;
}

/* 中部左侧边框 */
.border-middle-left {
  min-width: 12px;
  background-image: var(--border-middle-left);
}

/* 中部水平边框 */
.border-middle-horizontal {
  width: 100%;
  background-size: 1px;
  background-image: var(--border-middle-horizontal);
}

/* 中部右侧边框 */
.border-middle-right {
  min-width: 12px;
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

/* 底部边框容器 */
.container-border-bottom {
  height: 12px;
  overflow: hidden;
}

/* 底部左侧边框 */
.border-bottom-left {
  min-width: 12px;
  height: calc(12px * 2.5);
  /* 底部边框使用 space 是因为部分缩放比例下（如：10.5）使用 repeat 会出现 overflow 的元素没有全部隐藏的情况，导致底部显示黑边 */
  background-repeat: space;
  background-image: var(--border-bottom-left);
}

/* 底部水平边框 */
.border-horizontal-bottom {
  width: 100%;
  height: calc(12px * 2.5);
  background-repeat: space;
  background-size: 1px;
  background-image: var(--border-horizontal-bottom);
}

/* 底部右侧边框 */
.border-bottom-right {
  min-width: 12px;
  height: calc(12px * 2.5);
  background-repeat: space;
  background-image: var(--border-bottom-right);
}

.top {
  width: 100%;
  padding: 4px 6px 0 4px;
}
</style>
