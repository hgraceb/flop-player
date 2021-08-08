<template>
  <svg :height="height"
       :width="width"
       preserveaspectratio="none"
       viewBox="0 0 320 320"
       xmlns="http://www.w3.org/2000/svg"
  >
    <slot />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  }
})
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: baseline;
  margin-bottom: -2px;
}
</style>
