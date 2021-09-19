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
          <!-- 如果用户设置的语言不再当前可用语言列表中，则单独显示 -->
          <template v-if="!availableLocales.includes(locale)">
            <a-menu-item>
              <CheckOutlined />
              <a-icon-empty />
              {{ locale }}
            </a-menu-item>
            <a-menu-divider />
          </template>
          <a-menu-item v-for="(item, key) in availableLocales" :key="key" @click="changeLocales(item)">
            <CheckOutlined v-if="locale === item" />
            <a-icon-empty v-else />
            {{ $t('menu.language', item) }}
          </a-menu-item>
        </a-sub-menu>
        <a-menu-divider />
        <a-sub-menu :title="$t('menu.scaling')">
          <template #icon>
            <ExpandAltOutlined />
          </template>
          <!-- 如果用户当前设置的缩放比例不在预设的缩放比例中，则单独显示 -->
          <template v-if="!availableScales.includes(scale)">
            <a-menu-item>
              <CheckOutlined />
              <a-icon-empty />
              {{ scale.toFixed(2) }}x
            </a-menu-item>
            <a-menu-divider />
          </template>
          <a-menu-item v-for="(item, index) in availableScales" :key="index" @click="changeScale(item)">
            <CheckOutlined v-if="item === scale" />
            <a-icon-empty v-else />
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
import { CheckOutlined, ExpandAltOutlined, GlobalOutlined, SettingOutlined } from '@ant-design/icons-vue'
import AIconEmpty from '@/components/common/AIconEmpty.vue'

export default defineComponent({
  components: { AIconEmpty, CheckOutlined, ExpandAltOutlined, GlobalOutlined, SettingOutlined },
  setup () {
    const { locale, availableLocales } = useI18n()

    // 切换语言
    const changeLocales = (item: string) => {
      if (availableLocales.includes(item)) {
        locale.value = item
      }
    }

    // 用户设置的缩放比例
    const scale = computed(() => store.state.scale)
    // 所有可选的缩放比例
    const availableScales = SCALE_ARRAY
    // 设置缩放比例
    const changeScale = (scale: number) => {
      if (SCALE_ARRAY.includes(scale)) {
        store.commit('setScale', scale)
      }
    }

    return { locale, availableLocales, changeLocales, scale, availableScales, changeScale }
  }
})
</script>
