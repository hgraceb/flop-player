<template>
  <div :style="{'width': width + 'px'}" class="background" @dragstart.stop.prevent>
    <div class="flex">
      <div class="border-top-left" />
      <div class="border-horizontal-top" />
      <div class="border-top-right" />
    </div>
    <div class="flex">
      <div class="border-vertical-left-upper" />
      <div
        class="flex top space-between"
        @mousedown="handleMouseEvent(MouseStatus.DOWN)"
        @mouseleave="handleMouseEvent(MouseStatus.LEAVE)"
        @mouseup="handleMouseEvent(MouseStatus.UP)"
      >
        <TopCounter :count="mines" LpropF="" />
        <top-face :game-status="gameStatus" :mouse-status="mouseStatus" />
        <TopCounter :count="time" :min="0" />
      </div>
      <div class="border-vertical-right-upper" />
    </div>
    <div class="flex">
      <div class="border-middle-left" />
      <div class="border-horizontal-middle" />
      <div class="border-middle-right" />
    </div>
    <div :style="{'height': height + 'px'}" class="flex">
      <div class="border-vertical-left-lower" />
      <div class="block-container" />
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
  <br>
  <button type="button" @click="width += 16">width is: {{ width }}</button>
  <button type="button" @click="height += 16">height is: {{ height }}</button>
</template>

<script lang="ts">
import { GameStatus, MouseStatus } from '@/status'
import { defineComponent, ref } from 'vue'
import TopCounter from './TopCounter.vue'
import TopFace from './TopFace.vue'

export default defineComponent({
  name: 'Game',
  setup: () => {
    const mines = ref(-999)
    const time = ref(-222)
    const width = ref(128 + 24)
    const height = ref(128)
    const gameStatus = ref(GameStatus.PLAY)
    const mouseStatus = ref(MouseStatus.LEAVE)
    return { mines, time, width, height, gameStatus, mouseStatus, MouseStatus }
  },
  components: {
    TopCounter,
    TopFace
  },
  methods: {
    handleMouseEvent (mouseStatus: MouseStatus) {
      this.mouseStatus = mouseStatus
    }
  }
})
</script>

<!--测试用-->
<style scoped>
[class*='border'] {
  /*margin: 1px 0 0 1px;*/
}

button {
  width: 108px;
  text-align: left;
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

.block-container {
  width: 100%;
}
</style>
