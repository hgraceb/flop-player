<template>
  <use :transform="`translate(${translateX} ${translateY}) scale(${scale})`" :xlink:href="`#${name}`" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    name: {
      type: String,
      required: true
    },
    translateX: {
      type: Number,
      required: true
    },
    translateY: {
      type: Number,
      required: true
    },
    scale: {
      type: Number,
      required: false,
      default: 1.0
    }
  }
})
</script>
