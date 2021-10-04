<template>
  <!-- 鼠标轨迹，可以在 Menu 组件中结合 multiple 属性和 openChange 回调控制是否可以多选，但是会有样式显示问题，暂时不进行处理 -->
  <a-sub-menu :title="$t('menu.options.mousePath.title')">
    <template #icon>
      <StockOutlined />
    </template>
    <template v-for="(item, index) in menuMousePath" :key="index">
      <a-menu-item @click="item.click">
        <CheckOutlined v-if="item.checked" />
        <a-icon-empty v-else />
        {{ item.title }}
      </a-menu-item>
      <a-menu-divider v-if="item.divider" />
    </template>
  </a-sub-menu>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { store } from '@/store'
import { CheckOutlined, StockOutlined } from '@ant-design/icons-vue'
import AIconEmpty from '@/components/common/AIconEmpty.vue'

export default defineComponent({
  components: { AIconEmpty, CheckOutlined, StockOutlined },
  setup () {
    const { t } = useI18n()
    const menuMousePath = computed(() => {
      const result: { title: string, checked: boolean, divider?: boolean, click: () => void }[] = [
        {
          title: t('menu.options.mousePath.title'),
          checked: store.state.isMousePath,
          divider: true,
          click: () => store.commit('setMousePath', !store.state.isMousePath)
        },
        {
          title: t('menu.options.mousePath.move'),
          checked: store.state.isMousePathMove,
          click: () => store.commit('setMousePathMove', !store.state.isMousePathMove)
        },
        {
          title: t('menu.options.mousePath.left'),
          checked: store.state.isMousePathLeft,
          click: () => store.commit('setMousePathLeft', !store.state.isMousePathLeft)
        },
        {
          title: t('menu.options.mousePath.right'),
          checked: store.state.isMousePathRight,
          click: () => store.commit('setMousePathRight', !store.state.isMousePathRight)
        },
        {
          title: t('menu.options.mousePath.double'),
          checked: store.state.isMousePathDouble,
          click: () => store.commit('setMousePathDouble', !store.state.isMousePathDouble)
        }
      ]
      return result
    })

    return { menuMousePath }
  }
})
</script>
