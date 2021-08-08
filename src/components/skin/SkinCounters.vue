<template>
  <g :transform="`translate(0 ${translateY})`">
    <path :d="`M0 0L0 ${height}L30 ${height}L30 0L0 0z`" fill="#fff" />
    <path :d="`M30 0L30 ${height}L90 ${height}L90 0L30 0z`" fill="silver" />
    <path :d="`M90 0L90 ${height}L110 ${height}L110 0L90 0z`" fill="gray" />
    <path :d="`M110 0L110 ${height}L120 ${height}L120 0L110 0z`" fill="silver" />
  </g>
  <g :transform="`translate(${rightTranslateX} ${translateY})`">
    <path :d="`M0 0L0 ${height}L10 ${height}L10 0L0 0z`" fill="silver" />
    <path :d="`M10 0L10 ${height}L30 ${height}L30 0L10 0z`" fill="#fff" />
    <path :d="`M30 0L30 ${height}L90 ${height}L90 0L30 0z`" fill="silver" />
    <path :d="`M90 0L90 ${height}L120 ${height}L120 0L90 0z`" fill="gray" />
  </g>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { SIZE_BORDER_COUNTERS, SIZE_BORDER_TOP, SIZE_CELL, SVG_SCALE } from '@/game/constants'
import { store } from '@/store'

export default defineComponent({
  setup () {
    const translateY = SIZE_BORDER_TOP.height * SVG_SCALE
    const height = SIZE_BORDER_COUNTERS.height * SVG_SCALE
    const rightTranslateX = computed(() => {
      return (SIZE_BORDER_COUNTERS.width + store.state.width * SIZE_CELL.width) * SVG_SCALE
    })
    return { translateY, height, rightTranslateX }
  }
})
</script>
