<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <path style="fill:#ffffff" d="M0 0L0 110L10 110L10 100L20 100L20 90L30 90L30 0L0 0z" />
    <path style="fill:#c0c0c0" d="M30 0L30 90L20 90L20 100L10 100L10 110L0 110L0 120L10 120L10 110L20 110L20 100L30 100L30 90L120 90L120 30L100 30L100 20L110 20L110 10L120 10L120 0L110 0L110 10L100 10L100 20L90 20L90 0L30 0z" />
    <path style="fill:#808080" d="M90 0L90 20L100 20L100 10L110 10L110 0L90 0z" />
    <path style="fill:#ffffff" d="M110 10L110 20L100 20L100 30L120 30L120 10L110 10z" />
    <path style="fill:#808080" d="M30 90L30 100L20 100L20 110L10 110L10 120L120 120L120 90L30 90z" />
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
