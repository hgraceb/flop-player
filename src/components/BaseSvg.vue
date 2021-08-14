<template>
  <svg
    :height="height / SVG_SCALE"
    :viewBox="`0 0 ${width} ${height}`"
    :width="width / SVG_SCALE"
    preserveaspectratio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <slot />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { SVG_SCALE } from '@/game/constants'

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
  },
  setup () {
    return { SVG_SCALE }
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
