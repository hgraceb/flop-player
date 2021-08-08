<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <path style="fill:#ffffff" d="M0 0L0 20L30 20L30 0L0 0z"/>
    <path style="fill:#c0c0c0" d="M30 0L30 20L0 20L0 80L20 80L20 90L10 90L10 100L0 100L0 110L10 110L10 100L20 100L20 90L30 90L30 110L90 110L90 0L30 0z"/>
    <path style="fill:#808080" d="M90 0L90 110L120 110L120 0L90 0M0 80L0 100L10 100L10 90L20 90L20 80L0 80z"/>
    <path style="fill:#ffffff" d="M20 90L20 100L10 100L10 110L30 110L30 90L20 90z"/>
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
