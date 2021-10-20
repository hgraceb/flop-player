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
  <path :d="`M 90 520 h ${width - 180} l -30 30 h ${240 - width} v ${height - 890} l -30 30 Z`" fill="gray" />
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
