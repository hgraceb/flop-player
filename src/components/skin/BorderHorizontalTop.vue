<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <path style="fill:#ffffff" d="M0 0L0 30L10 30L10 0L0 0z"/>
    <path style="fill:#c0c0c0" d="M0 30L0 90L10 90L10 30L0 30z"/>
    <path style="fill:#808080" d="M0 90L0 110L10 110L10 90L0 90z"/>
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
