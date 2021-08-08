<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <path style="fill:#808080" d="M0 0L0 160L10 160L10 10L160 10L160 0L0 0z"/>
    <path style="fill:#c0c0c0" d="M10 10L10 160L160 160L160 10L10 10z"/>
    <path style="fill:#000000" d="M70 40L70 50L60 50L60 70L80 70L80 50L100 50L100 80L90 80L90 90L80 90L80 110L100 110L100 90L110 90L110 80L120 80L120 50L110 50L110 40L70 40M80 120L80 140L100 140L100 120L80 120z"/>
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
