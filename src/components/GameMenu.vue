<template>
  <a-dropdown>
    <a-button size="small">
      <SettingOutlined />
      {{ $t('menu.options') }}
    </a-button>
    <template #overlay>
      <a-menu>
        <a-sub-menu :title="$t('menu.toggleLanguages')">
          <template #icon>
            <GlobalOutlined />
          </template>
          <a-menu-item @click="toggleLocales">
            <CheckOutlined />
            {{ $t('menu.language') }}
          </a-menu-item>
        </a-sub-menu>
        <a-menu-divider />
        <a-sub-menu :title="$t('menu.scaling')">
          <template #icon>
            <ExpandAltOutlined />
          </template>
          <!-- 如果用户当前设置的缩放比例不在预设的缩放比例中，则单独显示 -->
          <template v-if="!scales.includes(scale)">
            <a-menu-item>
              <CheckOutlined />
              <span class="anticon" />
              {{ scale.toFixed(2) }}x
            </a-menu-item>
            <a-menu-divider />
          </template>
          <a-menu-item v-for="(item, index) in scales" :key="index" @click="changeScale(item)">
            <CheckOutlined v-if="item === scale" />
            <span v-if="item !== scale" class="anticon" />
            {{ item.toFixed(2).substring(0, 4) }}x
          </a-menu-item>
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
    const scale = computed(() => store.state.scale)
    // 所有可选的缩放比例
    const scales = SCALE_ARRAY
    // 设置缩放比例
    const changeScale = (scale: number) => {
      if (SCALE_ARRAY.includes(scale)) {
        store.commit('setScale', scale)
      }
    }

    return { toggleLocales, scale, scales, changeScale }
  }
})
</script>
