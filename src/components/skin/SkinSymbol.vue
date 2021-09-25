<template>
  <use :transform="`translate(${translateX} ${translateY})`" :xlink:href="`#${name}`" />
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
    }
  }
})
</script>
