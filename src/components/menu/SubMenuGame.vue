<template>
  <a-sub-menu :title="$t('menu.game.title')">
    <a-menu-item @click="fileSelect">
      <FileSearchOutlined />
      <span :title="$t('common.fileSelect')">{{ $t('menu.game.localVideo') }}</span>
      <!-- 使用 accept 属性对文件进行筛选可能会导致部分浏览器无法正常获取文件，如：Quark 5.3.8.193 (Android) -->
      <input ref="fileInputElement" style="display: none" type="file" @change="fileChange" />
    </a-menu-item>
  </a-sub-menu>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { store } from '@/store'
import { FileSearchOutlined } from '@ant-design/icons-vue'

export default defineComponent({
  components: { FileSearchOutlined },
  setup () {
    // 鼠标双击坐标点对应的元素
    const fileInputElement = ref<HTMLInputElement>()
    // 打开文件选择页面
    const fileSelect = () => fileInputElement.value?.click()
    // 选择的文件发生改变
    const fileChange = () => store.dispatch('fetchFiles', fileInputElement.value?.files)

    return { fileInputElement, fileSelect, fileChange }
  }
})
</script>
