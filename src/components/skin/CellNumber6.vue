<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <path style="fill:#808080" d="M0 0L0 160L10 160L10 10L160 10L160 0L0 0z" />
    <path style="fill:#c0c0c0" d="M10 10L10 160L160 160L160 10L10 10z" />
    <path style="fill:#008080" d="M40 30L40 40L30 40L30 120L40 120L40 130L120 130L120 120L130 120L130 80L120 80L120 70L60 70L60 50L120 50L120 30L40 30z" />
    <path style="fill:#c0c0c0" d="M60 90L60 110L100 110L100 90L60 90z" />
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
