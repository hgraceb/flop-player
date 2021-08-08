<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <path style="fill:#ffffff" d="M0 0L0 110L30 110L30 0L0 0z" />
    <path style="fill:#c0c0c0" d="M30 0L30 110L90 110L90 80L120 80L120 20L100 20L100 10L110 10L110 0L100 0L100 10L90 10L90 0L30 0z" />
    <path style="fill:#808080" d="M90 0L90 10L100 10L100 0L90 0z" />
    <path style="fill:#ffffff" d="M110 0L110 10L100 10L100 20L120 20L120 0L110 0z" />
    <path style="fill:#808080" d="M90 80L90 110L120 110L120 80L90 80z" />
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
