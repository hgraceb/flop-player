<template>
  <a-dropdown>
    <a-button size="small">
      {{ $t('menu.options') }}
    </a-button>
    <template #overlay>
      <a-menu>
        <a-sub-menu :title="$t('menu.toggleLanguages')">
          <a-menu-item @click="toggleLocales">
            <CheckOutlined />
            {{ $t('menu.language') }}
          </a-menu-item>
        </a-sub-menu>
        <a-menu-divider />
        <a-sub-menu :title="`${$t('menu.scaling')} (${scale}x)`">
          <a-menu-item :disabled="zoomOutDisabled" @click="zoomOutScale">{{ $t('menu.zoomOut') }}</a-menu-item>
          <a-menu-item :disabled="zoomInDisabled" @click="zoomInScale">{{ $t('menu.zoomIn') }}</a-menu-item>
        </a-sub-menu>
      </a-menu>
    </template>
  </a-dropdown>
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
    const scale = computed(() => store.state.scale.toFixed(2).substring(0, 4))

    const zoomOutScale = () => store.commit('setScale', SCALE_ARRAY[SCALE_ARRAY.indexOf(store.state.scale) - 1])
    const zoomInScale = () => store.commit('setScale', SCALE_ARRAY[SCALE_ARRAY.indexOf(store.state.scale) + 1])
    const zoomOutDisabled = computed(() => store.state.scale <= SCALE_ARRAY[0])
    const zoomInDisabled = computed(() => store.state.scale >= SCALE_ARRAY[SCALE_ARRAY.length - 1])

    return { toggleLocales, scale, zoomOutScale, zoomInScale, zoomOutDisabled, zoomInDisabled }
  }
})
</script>
