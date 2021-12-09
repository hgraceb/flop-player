<template>
  <a-menu v-if="show" :title="$t('menu.exit.title')" mode="horizontal">
    <!-- 点击退出，鼠标指针悬停在可点击区域时显示一样的光标样式 -->
    <a-sub-menu style="cursor: pointer" @click="exit">
      <template #title>
        <CloseOutlined />
      </template>
    </a-sub-menu>
  </a-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CloseOutlined } from '@ant-design/icons-vue'
import { store } from '@/store'

export default defineComponent({
  components: { CloseOutlined },
  setup () {
    const show = self !== top
    const exit = () => store.commit('setExit', true)
    return { show, exit }
  }
})
</script>
