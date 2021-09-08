<template>
  <button @click="toggleLocales">{{ $t('menu.toggleLanguages') }}</button>
  <div>
    <button :disabled="zoomOutDisabled" @click="zoomOutScale">{{ $t('menu.zoomOut') }}</button>
    <button :disabled="zoomInDisabled" @click="zoomInScale">{{ $t('menu.zoomIn') }}</button>
    <span>{{ scale }}x</span>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { store } from '@/store'
import { SCALE_ARRAY } from '@/game/constants'

export default defineComponent({
  setup () {
    const { locale, availableLocales } = useI18n()

    // 切换语言
    const toggleLocales = () => {
      locale.value = availableLocales[(availableLocales.indexOf(locale.value) + 1) % availableLocales.length]
    }

    // 用户设置的缩放比例
    const scale = computed(() => store.state.scale)

    const zoomOutScale = () => store.commit('setScale', SCALE_ARRAY[SCALE_ARRAY.indexOf(store.state.scale) - 1])
    const zoomInScale = () => store.commit('setScale', SCALE_ARRAY[SCALE_ARRAY.indexOf(store.state.scale) + 1])
    const zoomOutDisabled = computed(() => store.state.scale <= SCALE_ARRAY[0])
    const zoomInDisabled = computed(() => store.state.scale >= SCALE_ARRAY[SCALE_ARRAY.length - 1])

    return { toggleLocales, scale, zoomOutScale, zoomInScale, zoomOutDisabled, zoomInDisabled }
  }
})
</script>
