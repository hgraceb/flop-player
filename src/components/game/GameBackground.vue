<template>
  <!-- 背景 -->
  <path :d="`M 0 0 h ${width} v ${height} h ${-width} Z`" fill="silver" />
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
