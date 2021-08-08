<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <path style="fill:#808080" d="M0 0L0 160L10 160L10 10L160 10L160 0L0 0z" />
    <path style="fill:#c0c0c0" d="M10 10L10 160L160 160L160 10L10 10z" />
    <path style="fill:#000000" d="M80 20L80 40L60 40L60 50L50 50L50 40L40 40L40 50L50 50L50 60L40 60L40 80L20 80L20 90L40 90L40 110L50 110L50 120L40 120L40 130L50 130L50 120L60 120L60 130L80 130L80 150L90 150L90 130L110 130L110 120L120 120L120 130L130 130L130 120L120 120L120 110L130 110L130 90L150 90L150 80L130 80L130 60L120 60L120 50L130 50L130 40L120 40L120 50L110 50L110 40L90 40L90 20L80 20z" />
    <path style="fill:#ffffff" d="M60 60L60 80L80 80L80 60L60 60z" />
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
