<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <path style="fill:#ffffff" d="M0 0L0 150L10 150L10 140L20 140L20 20L140 20L140 10L150 10L150 0L0 0z" />
    <path style="fill:#c0c0c0" d="M150 0L150 10L140 10L140 20L20 20L20 140L10 140L10 150L0 150L0 160L10 160L10 150L20 150L20 140L140 140L140 20L150 20L150 10L160 10L160 0L150 0z" />
    <path style="fill:#808080" d="M150 10L150 20L140 20L140 140L20 140L20 150L10 150L10 160L160 160L160 10L150 10z" />
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
