<template>
  <!-- 外边框：顶部和左侧的白色边框 -->
  <path :d="`M 0 0 h ${width} l -30 30 h ${60 - width} v ${height - 60} l -30 30 Z`" fill="white" />
  <!-- 外边框：底部和右侧的灰色边框  -->
  <path :d="`M ${width} 0 v ${height} h ${-width} l 30 -30 h ${width - 60} v ${60 - height} Z`" fill="gray" />
  <!-- 计数器：顶部和左侧的灰色边框  -->
  <path :d="`M 90 90 h ${width - 180} l -20 20 h ${220 - width} v 330 l -20 20 Z`" fill="gray" />
  <!-- 计数器：底部和右侧的白色边框 -->
  <path :d="`M ${width - 90} 90 v 370 h ${180 - width} l 20 -20 h ${width - 220} v -330 Z`" fill="white" />
  <!-- 游戏区域：顶部和左侧的灰色边框  -->
  <path :d="`M 90 520 h ${width - 180} l -30 30 h ${240 - width} v ${height - 890} l -30 30 Z`" class="game-top-left" fill="gray" />
  <!-- 游戏区域：底部和右侧的白色边框 -->
  <path :d="`M ${width - 90} 520 v ${height - 830} h ${180 - width} l 30 -30 h ${width - 240} v ${890 - height} Z`" fill="white" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  }
})
</script>

<style scoped>
.game-top-left {
  /* 游戏区域顶部和左侧的灰色边框不响应鼠标事件，避免首行方块的首行像素点无法点击，Windows 64 位的 Chrome 96.0.4664.45 和 Firefox 94.0.2 都会有这个问题 */
  /* 但是 Chrome 在部分缩放比例下还是有问题，如：电脑缩放缩放 200%、Chrome 缩放 300% 时......Chrome 牛逼 (´。＿。｀) */
  /* 游戏区域底部和右侧的灰色边框需要响应并拦截鼠标事件，因为方块有用于填补部分缩放比例下白边的多余部分 */
  pointer-events: none;
}
</style>
