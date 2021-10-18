<template>
  <!-- 录像地图，可以在 Menu 组件中结合 multiple 属性和 openChange 回调控制是否可以多选，但是会有样式显示问题，暂时不进行处理 -->
  <a-sub-menu :title="$t('menu.options.videoMap.title')">
    <template #icon>
      <EyeOutlined />
    </template>
    <template v-for="(item, index) in menuVideoMap" :key="index">
      <a-menu-item @click="item.click">
        <CheckOutlined v-if="item.checked" />
        <a-icon-empty v-else />
        <div style="display: inline-block">
          <div :style="`display: flex;align-items: center;width: ${maxTitleWidth}px;margin-left: 4px`">
            <!-- 菜单标题 -->
            {{ item.title }}
            <!-- 颜色提示 -->
            <base-svg v-if="item.color" :height="100" :width="100" style="margin-left: auto;">
              <!-- 非透明认为是鼠标点击事件 -->
              <polygon v-if="item.color !== 'transparent'" :style="`fill: ${item.color};stroke: none;`" points="0,0 0,100 100,100 100,0" />
              <!-- 透明则认为是鼠标移动路径 -->
              <template v-else>
                <polygon points="0,0 0,100 100,100 100,0" style="fill: rgba(0, 0, 0, .25);stroke: none;" />
                <polyline points="0,50 100,50" style="fill: none;stroke: white;stroke-width: 10" />
              </template>
            </base-svg>
          </div>
        </div>
      </a-menu-item>
      <a-menu-divider v-if="item.divider" />
    </template>
  </a-sub-menu>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { store } from '@/store'
import { CheckOutlined, EyeOutlined } from '@ant-design/icons-vue'
import AIconEmpty from '@/components/common/AIconEmpty.vue'
import BaseSvg from '@/components/BaseSvg.vue'
import { getStrWidth } from '@/util/common'

export default defineComponent({
  components: { BaseSvg, AIconEmpty, CheckOutlined, EyeOutlined },
  setup () {
    const { t } = useI18n()
    // 鼠标路径菜单信息
    const menuVideoMap = computed(() => {
      const result: { title: string, checked: boolean, divider?: boolean, color?: string, click: () => void }[] = [
        {
          title: t('menu.options.videoMap.title'),
          checked: store.state.isVideoMap,
          divider: true,
          click: () => store.commit('setVideoMap', !store.state.isVideoMap)
        },
        {
          title: t('menu.options.videoMap.move'),
          checked: store.state.isMousePathMove,
          color: 'transparent',
          click: () => store.commit('setMousePathMove', !store.state.isMousePathMove)
        },
        {
          title: t('menu.options.videoMap.left'),
          checked: store.state.isMousePathLeft,
          color: '#00ffff',
          click: () => store.commit('setMousePathLeft', !store.state.isMousePathLeft)
        },
        {
          title: t('menu.options.videoMap.right'),
          checked: store.state.isMousePathRight,
          color: '#00ff00',
          click: () => store.commit('setMousePathRight', !store.state.isMousePathRight)
        },
        {
          title: t('menu.options.videoMap.double'),
          checked: store.state.isMousePathDouble,
          color: '#ff00ff',
          click: () => store.commit('setMousePathDouble', !store.state.isMousePathDouble)
        }
      ]
      return result
    })
    // 字号和字体
    const font = computed(() => {
      // 直接获取 body 的字号和字体，有问题再说吧 (*￣3￣)╭
      const computedStyle = window.getComputedStyle(document.body, null)
      return `${computedStyle.getPropertyValue('font-size')} ${computedStyle.getPropertyValue('font-family')}`
    })
    // 最大标题宽度，用于右侧元素对齐
    const maxTitleWidth = computed(() => {
      let width = 0
      for (const menu of menuVideoMap.value) {
        const titleWidth = getStrWidth(menu.title, font.value)
        // 更新标题最大宽度
        width = titleWidth && titleWidth > width ? titleWidth : width
      }
      // 20 的宽度是留给右侧元素的，如果宽度计算失败则返回 -1，不对最大宽度进行设置
      return width > 0 ? width + 20 : -1
    })

    return { menuVideoMap, maxTitleWidth }
  }
})
</script>
