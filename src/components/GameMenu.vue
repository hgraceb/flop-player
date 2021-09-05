<template>
  <button @click="toggleLocales">{{ $t('menu.toggle-languages') }}</button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  setup () {
    const { locale, availableLocales } = useI18n()

    const toggleLocales = () => {
      // change to some real logic
      const locales = availableLocales
      locale.value = locales[(locales.indexOf(locale.value) + 1) % locales.length]
    }
    return { toggleLocales }
  }
})
</script>
