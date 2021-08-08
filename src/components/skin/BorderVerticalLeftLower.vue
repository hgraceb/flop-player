<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <path style="fill:#ffffff" d="M0 0L0 10L30 10L30 0L0 0z"/>
    <path style="fill:#c0c0c0" d="M30 0L30 10L90 10L90 0L30 0z"/>
    <path style="fill:#808080" d="M90 0L90 10L120 10L120 0L90 0z"/>
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
