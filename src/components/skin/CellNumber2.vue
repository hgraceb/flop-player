<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <path style="fill:#808080" d="M0 0L0 160L10 160L10 10L160 10L160 0L0 0z" />
    <path style="fill:#c0c0c0" d="M10 10L10 160L160 160L160 10L10 10z" />
    <path style="fill:#008000" d="M40 30L40 40L30 40L30 60L60 60L60 50L100 50L100 70L80 70L80 80L60 80L60 90L40 90L40 100L30 100L30 130L130 130L130 110L70 110L70 100L90 100L90 90L110 90L110 80L120 80L120 70L130 70L130 40L120 40L120 30L40 30z" />
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
