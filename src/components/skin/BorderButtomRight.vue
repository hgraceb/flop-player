<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <path style="fill:#ffffff" d="M0 0L0 30L30 30L30 0L0 0z"/>
    <path style="fill:#c0c0c0" d="M30 0L30 30L0 30L0 90L90 90L90 0L30 0z"/>
    <path style="fill:#808080" d="M90 0L90 90L0 90L0 120L120 120L120 0L90 0z"/>
  </g>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

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
  }
})
</script>
