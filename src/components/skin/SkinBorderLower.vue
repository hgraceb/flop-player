<template>
  <g :transform="`translate(0 ${translateY})`">
    <path :d="`M0 0L0 ${height}L30 ${height}L30 0L0 0z`" fill="#fff" />
    <path :d="`M30 0L30 ${height}L90 ${height}L90 0L30 0z`" fill="silver" />
    <path :d="`M90 0L90 ${height}L120 ${height}L120 0L90 0z`" fill="gray" />
  </g>
  <g :transform="`translate(${rightTranslateX} ${translateY})`">
    <path :d="`M0 0L0 ${height}L30 ${height}L30 0L0 0z`" fill="#fff" />
    <path :d="`M30 0L30 ${height}L90 ${height}L90 0L30 0z`" fill="silver" />
    <path :d="`M90 0L90 ${height}L120 ${height}L120 0L90 0z`" fill="gray" />
  </g>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import {
  SIZE_BORDER_LOWER,
  SIZE_BORDER_MIDDLE,
  SIZE_BORDER_TOP,
  SIZE_BORDER_UPPER,
  SIZE_CELL,
  SVG_SCALE
} from '@/game/constants'
import { store } from '@/store'

export default defineComponent({
  setup () {
    const translateY = computed(() => {
      return (SIZE_BORDER_TOP.height + SIZE_BORDER_UPPER.height + SIZE_BORDER_MIDDLE.height) * SVG_SCALE
    })
    const height = computed(() => {
      return SIZE_BORDER_LOWER.height * store.state.height * SIZE_CELL.height * SVG_SCALE
    })
    const rightTranslateX = computed(() => {
      return (SIZE_BORDER_LOWER.width + store.state.width * SIZE_CELL.width) * SVG_SCALE
    })
    return { translateY, height, rightTranslateX }
  }
})
</script>
