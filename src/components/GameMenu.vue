<template>
  <!-- 设置 triggerSubMenuAction="click" 可以将菜单展开方式切换为点击后展开（源代码中查看的属性，不同版本可能会有差异） -->
  <a-menu v-model:selectedKeys="selected" :style="`width: ${width}px`" class="game-menu" mode="horizontal">
    <a-sub-menu :title="$t('menu.game.title')">
    </a-sub-menu>
    <a-sub-menu :title="$t('menu.options.title')">
      <a-sub-menu :title="$t('menu.options.toggleLanguages')">
        <template #icon>
          <GlobalOutlined />
        </template>
        <!-- 如果用户设置的语言不再当前可用语言列表中，则单独显示 -->
        <template v-if="!availableLocales.includes(locale)">
          <a-menu-item>
            <CheckOutlined />
            {{ locale }}
          </a-menu-item>
          <a-menu-divider />
        </template>
        <a-menu-item v-for="(item, key) in availableLocales" :key="key" @click="changeLocales(item)">
          <CheckOutlined v-if="locale === item" />
          <a-icon-empty v-else />
          {{ $t('menu.options.language', item) }}
        </a-menu-item>
      </a-sub-menu>

      <!-- 鼠标轨迹 -->
      <sub-menu-mouse-path />

      <!-- 缩放比例 -->
      <a-menu-divider />
      <a-sub-menu :title="$t('menu.options.scaling')">
        <template #icon>
          <ExpandAltOutlined />
        </template>
        <!-- 如果用户当前设置的缩放比例不在预设的缩放比例中，则单独显示 -->
        <template v-if="!availableScales.includes(scale)">
          <a-menu-item>
            <CheckOutlined />
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
    </a-sub-menu>
    <a-sub-menu :title="$t('menu.help.title')">
    </a-sub-menu>
  </a-menu>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { store } from '@/store'
import { CELL_SIDE_LENGTH, GAME_TOP_UPPER, SCALE_ARRAY } from '@/game/constants'
import { CheckOutlined, ExpandAltOutlined, GlobalOutlined } from '@ant-design/icons-vue'
import AIconEmpty from '@/components/common/AIconEmpty.vue'
import SubMenuMousePath from '@/components/menu/SubMenuMousePath.vue'

export default defineComponent({
  components: { SubMenuMousePath, AIconEmpty, CheckOutlined, ExpandAltOutlined, GlobalOutlined },
  setup () {
    // 菜单宽度
    const width = computed(() => {
      return GAME_TOP_UPPER.widthLeft + GAME_TOP_UPPER.widthRight + store.state.width * CELL_SIDE_LENGTH
    })
    // 当前选中的菜单项 key 数组，设置为 null 实现不可变的效果
    const selected = null

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

    return { width, selected, locale, availableLocales, changeLocales, scale, availableScales, changeScale }
  }
})
</script>

<style scoped>
.game-menu {
  /* 设置游戏菜单行高 */
  line-height: 24px;
}

.game-menu ::v-deep(li) {
  /* 使用调整内边距的方式进行排版，使用 margin 属性进行调整的话会影响菜单折叠功能 */
  padding: 0 5px !important;
}

.game-menu ::v-deep(li::after) {
  /* 取消游戏菜单选中后底部边框的显示 */
  border-bottom: 0 !important;
}
</style>
