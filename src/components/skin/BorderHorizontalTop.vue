<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <path :d="`M0 0L0 30L${width} 30L${width} 0L0 0z`" fill="#fff" />
    <path :d="`M0 30L0 90L${width} 90L${width} 30L0 30z`" fill="silver" />
    <path :d="`M0 90L0 110L${width} 110L${width} 90L0 90z`" fill="gray" />
  </g>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { SIZE_BORDER_TOP } from '@/game/constants'
import { store } from '@/store'

export default defineComponent({
  props: {
    translateX: {
      type: Number,
      required: true
    },
    translateY: {
      type: Number,
      required: true
    }
  },
  setup () {
    const width = SIZE_BORDER_TOP.widthHorizontal * store.state.width * store.state.sideLength
    return { width }
  }
})
</script>
