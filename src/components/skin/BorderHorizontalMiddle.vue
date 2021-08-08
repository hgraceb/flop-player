<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <path style="fill:#ffffff" d="M0 0L0 20L10 20L10 0L0 0z"/>
    <path style="fill:#c0c0c0" d="M0 20L0 80L10 80L10 20L0 20z"/>
    <path style="fill:#808080" d="M0 80L0 110L10 110L10 80L0 80z"/>
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
