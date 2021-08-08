<template>
  <svg :height="height"
       :width="width"
       preserveaspectratio="none"
       viewBox="0 0 320 320"
       xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <slot />
    </g>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    iconName: {
      type: String,
      default: 'box'
    },
    width: {
      type: [Number, String],
      default: 180
    },
    height: {
      type: [Number, String],
      default: 180
    },
    iconColor: {
      type: String,
      default: 'currentColor'
    }
  }
})
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: baseline;
  margin-bottom: -2px; /* yes, I'm that particular about formatting */
}
</style>
