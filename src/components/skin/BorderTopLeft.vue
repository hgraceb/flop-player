<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <path style="fill:#ffffff" d="M0 0L0 110L30 110L30 30L120 30L120 0L0 0z" />
    <path style="fill:#c0c0c0" d="M30 30L30 110L90 110L90 90L120 90L120 30L30 30z" />
    <path style="fill:#808080" d="M90 90L90 110L120 110L120 90L90 90z" />
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
