<template>
  <div class="background" :style="{'width': width + 'px'}">
    <div class="flex">
      <div class="border-top-left"></div>
      <div class="border-horizontal-top"></div>
      <div class="border-top-right"></div>
    </div>
    <div class="flex">
      <div class="border-vertical-left-upper"></div>
      <div class="flex top space-between">
        <TopCounter :count="mines"></TopCounter>
        <div class="face-normal"></div>
        <TopCounter :count="time" :min="0"></TopCounter>
      </div>
      <div class="border-vertical-right-upper"></div>
    </div>
    <div class="flex">
      <div class="border-middle-left"></div>
      <div class="border-horizontal-middle"></div>
      <div class="border-middle-right"></div>
    </div>
    <div class="flex" :style="{'height': height + 'px'}">
      <div class="border-vertical-left-lower"></div>
      <div class="block-container"></div>
      <div class="border-vertical-right-lower"></div>
    </div>
    <div class="flex">
      <div class="border-bottom-left"></div>
      <div class="border-horizontal-bottom"></div>
      <div class="border-bottom-right"></div>
    </div>
    <div></div>
    <div></div>
    <div></div>
  </div>
  <button type="button" @click="mines = mines < 1200 ? mines + 111 : -1000">mines is: {{ mines }}</button>
  <button type="button" @click="time = time < 1200 ? time + 111 : -1000">time is: {{ time }}</button>
  <button type="button" @click="width++">width is: {{ width }}</button>
  <button type="button" @click="height++">height is: {{ height }}</button>
</template>

<script lang="ts">
import {ref, defineComponent} from 'vue'
import TopCounter from './TopCounter.vue'

export default defineComponent({
  name: 'Game',
  setup: () => {
    const mines = ref(-1000)
    const time = ref(-1000)
    const width = ref(128 + 24)
    const height = ref(128)
    return {mines, time, width, height}
  },
  components: {
    TopCounter
  }
})
</script>

<!--测试用-->
<style scoped>
[class*='border'] {
  /*margin: 1px 0 0 1px;*/
}
</style>

<style scoped>
.border-top-left {
  min-width: 12px;
  height: 11px;
  background-image: url("../assets/border-top-left.bmp");
}

.border-horizontal-top {
  width: 100%;
  height: 11px;
  background-image: url("../assets/border-horizontal-top.bmp");
}

.border-top-right {
  min-width: 12px;
  height: 11px;
  background-image: url("../assets/border-top-right.bmp");
}

.border-vertical-left-upper {
  min-width: 12px;
  height: 33px;
  background-image: url("../assets/border-vertical-left-upper.bmp");
}

.border-vertical-right-upper {
  min-width: 12px;
  height: 33px;
  background-image: url("../assets/border-vertical-right-upper.bmp");
}

.border-middle-left {
  min-width: 12px;
  height: 11px;
  background-image: url("../assets/border-middle-left.bmp");
}

.border-horizontal-middle {
  width: 100%;
  height: 11px;
  background-image: url("../assets/border-horizontal-middle.bmp");
}

.border-middle-right {
  min-width: 12px;
  height: 11px;
  background-image: url("../assets/border-middle-right.bmp");
}

.border-vertical-left-lower {
  min-width: 12px;
  height: 100%;
  background-image: url("../assets/border-vertical-left-lower.bmp");
}

.border-vertical-right-lower {
  min-width: 12px;
  height: 100%;
  background-image: url("../assets/border-vertical-right-lower.bmp");
}

.border-bottom-left {
  min-width: 12px;
  height: 12px;
  background-image: url("../assets/border-bottom-left.bmp");
}

.border-horizontal-bottom {
  width: 100%;
  height: 12px;
  background-image: url("../assets/border-horizontal-bottom.bmp");
}

.border-bottom-right {
  min-width: 12px;
  height: 12px;
  background-image: url("../assets/border-bottom-right.bmp");
}

.top {
  width: 100%;
  padding: 4px 6px 0 4px;
}

.face-normal {
  min-width: 26px;
  height: 26px;
  background-image: url("../assets/face-normal.bmp");
}

.block-container {
  width: 100%;
}

.background {
  background-image: url("../assets/top-fill.bmp");
}
</style>
