<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <path style="fill:#808080" d="M0 0L0 160L10 160L10 10L160 10L160 0L0 0z" />
    <path style="fill:#c0c0c0" d="M10 10L10 160L160 160L160 10L10 10z" />
    <path style="fill:#000080" d="M50 30L50 50L40 50L40 70L30 70L30 90L90 90L90 130L120 130L120 90L130 90L130 70L120 70L120 30L90 30L90 70L70 70L70 50L80 50L80 30L50 30z" />
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
