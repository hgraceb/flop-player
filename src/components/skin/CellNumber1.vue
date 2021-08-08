<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <path style="fill:#808080" d="M0 0L0 160L10 160L10 10L160 10L160 0L0 0z" />
    <path style="fill:#c0c0c0" d="M10 10L10 160L160 160L160 10L10 10z" />
    <path style="fill:#0000ff" d="M80 30L80 40L70 40L70 50L60 50L60 60L50 60L50 70L70 70L70 110L50 110L50 130L120 130L120 110L100 110L100 30L80 30z" />
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
