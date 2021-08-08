<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <path style="fill:#ffffff" d="M0 0L0 150L10 150L10 140L20 140L20 20L140 20L140 10L150 10L150 0L0 0z" />
    <path style="fill:#c0c0c0" d="M150 0L150 10L140 10L140 20L20 20L20 140L10 140L10 150L0 150L0 160L10 160L10 150L20 150L20 140L140 140L140 20L150 20L150 10L160 10L160 0L150 0z" />
    <path style="fill:#808080" d="M150 10L150 20L140 20L140 140L20 140L20 150L10 150L10 160L160 160L160 10L150 10z" />
    <path style="fill:#ff0000" d="M70 30L70 40L50 40L50 50L40 50L40 60L50 60L50 70L70 70L70 80L90 80L90 30L70 30z" />
    <path style="fill:#000000" d="M80 80L80 100L60 100L60 110L40 110L40 130L120 130L120 110L100 110L100 100L90 100L90 80L80 80z" />
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
