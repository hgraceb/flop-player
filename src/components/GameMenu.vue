<template>
  <div :style="`display: flex;width: ${width}px`">
    <!-- 设置 triggerSubMenuAction="click" 可以将菜单展开方式切换为点击后展开（源代码中查看的属性，不同版本可能会有差异） -->
    <!-- 将当前选中的菜单项 key 数组设置为 null，实现不可变的效果；将 width 设置为 0 是为了菜单可以正常折叠 -->
    <a-menu :selectedKeys="null" class="game-menu" mode="horizontal" style="flex-grow: 1;width: 0">
      <!-- 游戏 -->
      <sub-menu-game />

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

        <!-- 录像地图 -->
        <sub-menu-video-map />

        <!-- 方块实际显示边长 -->
        <a-menu-divider />
        <a-sub-menu :title="$t('menu.options.squareSize')">
          <template #icon>
            <ExpandAltOutlined />
          </template>
          <!-- 如果用户当前设置的方块实际显示边长不在预设中，则单独显示 -->
          <template v-if="!availableSquareSize.includes(squareSize)">
            <a-menu-item>
              <CheckOutlined />
              {{ squareSize }}
            </a-menu-item>
            <a-menu-divider />
          </template>
          <a-menu-item v-for="(item, index) in availableSquareSize" :key="index" @click="changeSquareSize(item)">
            <CheckOutlined v-if="item === squareSize" />
            <a-icon-empty v-else />
            {{ item }}
          </a-menu-item>
        </a-sub-menu>
      </a-sub-menu>
      <a-sub-menu :title="$t('menu.help.title')">
      </a-sub-menu>
    </a-menu>
    <!-- 退出菜单 -->
    <menu-exit class="game-menu" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { store } from '@/store'
import { GAME_TOP_UPPER, SQUARE_SIZE_ARRAY } from '@/game/constants'
import { CheckOutlined, ExpandAltOutlined, GlobalOutlined } from '@ant-design/icons-vue'
import AIconEmpty from '@/components/common/AIconEmpty.vue'
import SubMenuVideoMap from '@/components/menu/SubMenuVideoMap.vue'
import SubMenuGame from '@/components/menu/SubMenuGame.vue'
import MenuExit from '@/components/menu/MenuExit.vue'

export default defineComponent({
  components: { MenuExit, SubMenuGame, SubMenuVideoMap, AIconEmpty, CheckOutlined, ExpandAltOutlined, GlobalOutlined },
  setup () {
    // 菜单宽度
    const width = computed(() => GAME_TOP_UPPER.widthLeft + GAME_TOP_UPPER.widthRight + store.getters.getDisplayWidth * store.state.squareSize)

    const { locale, availableLocales } = useI18n()
    // 切换语言
    const changeLocales = (item: string) => store.commit('setLocale', item)

    // 用户设置的方块实际显示边长
    const squareSize = computed(() => store.state.squareSize)
    // 所有可选的方块实际显示边长
    const availableSquareSize = SQUARE_SIZE_ARRAY
    // 设置方块实际显示边长
    const changeSquareSize = (squareSize: number) => store.commit('setSquareSize', squareSize)

    return { width, locale, availableLocales, changeLocales, squareSize, availableSquareSize, changeSquareSize }
  }
})
</script>

<style scoped>
.game-menu {
  /* 设置最小宽度与行高一致，避免菜单不显示，如：在 iframe 中连续打开两次不支持文件类型的录像时，关闭菜单会被隐藏 */
  min-width: 24px;
  /* 设置游戏菜单行高 */
  line-height: 24px;
  /* SVG 动画效果不好，为了统一 SVG 和游戏菜单的动画效果，去除游戏菜单宽度改变时的动画效果，原始值：background 0.3s ease 0s, width 0.3s cubic-bezier(0.2, 0, 0, 1) 0s */
  transition: background 0.3s ease 0s;
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
