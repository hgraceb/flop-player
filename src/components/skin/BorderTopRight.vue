<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <path style="fill:#ffffff" d="M0 0L0 30L90 30L90 20L100 20L100 10L110 10L110 0L0 0z" />
    <path style="fill:#c0c0c0" d="M110 0L110 10L100 10L100 20L90 20L90 30L0 30L0 90L20 90L20 100L10 100L10 110L20 110L20 100L30 100L30 110L90 110L90 30L100 30L100 20L110 20L110 10L120 10L120 0L110 0z" />
    <path style="fill:#808080" d="M110 10L110 20L100 20L100 30L90 30L90 110L120 110L120 10L110 10M0 90L0 110L10 110L10 100L20 100L20 90L0 90z" />
    <path style="fill:#ffffff" d="M20 100L20 110L30 110L30 100L20 100z" />
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
