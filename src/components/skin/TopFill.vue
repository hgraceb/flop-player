<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <path style="fill:#c0c0c0" d="M0 0L0 10L10 10L10 0L0 0z" />
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
