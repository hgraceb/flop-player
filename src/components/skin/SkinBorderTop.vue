<template>
  <skin-symbol :translate-x="0" :translate-y="0" name="border-top-left"></skin-symbol>
  <border-horizontal-top :translate-x="horizontalTranslateX" :translate-y="0"></border-horizontal-top>
  <skin-symbol :translate-x="rightTranslateX" :translate-y="0" name="border-top-right"></skin-symbol>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'
import { SIZE_BORDER_TOP } from '@/game/constants'
import { store } from '@/store'
import BorderHorizontalTop from '@/components/skin/BorderHorizontalTop.vue'

export default defineComponent({
  components: { BorderHorizontalTop, SkinSymbol },
  setup () {
    const horizontalTranslateX = SIZE_BORDER_TOP.widthLeft
    const rightTranslateX = SIZE_BORDER_TOP.widthLeft + store.state.width * SIZE_BORDER_TOP.widthHorizontal * 16
    return { horizontalTranslateX, rightTranslateX }
  }
})
</script>
