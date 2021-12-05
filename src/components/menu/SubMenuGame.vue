<template>
  <a-sub-menu :title="$t('menu.game.title')">
    <a-menu-item :title="$t('common.fileSelect')" @click="fileSelect">
      <FileSearchOutlined />
      <span>{{ $t('menu.game.localVideo') }}</span>
      <!-- 使用 accept 属性对文件进行筛选可能会导致部分浏览器无法正常获取文件，如：Quark 5.3.8.193 (Android) -->
      <input ref="fileInputElement" style="display: none" type="file" @change="fileChange" />
    </a-menu-item>
    <a-menu-item :title="$t('common.fileSelect')" @click="toggleFileDrag">
      <CheckOutlined v-if="fileDrag" />
      <a-icon-empty v-else />
      <span>{{ $t('menu.game.fileDrag') }}</span>
    </a-menu-item>
    <a-menu-divider />
    <a-menu-item :disabled="marksDisabled" @click="toggleMarks">
      <CheckOutlined v-if="marks" />
      <a-icon-empty v-else />
      <span>{{ $t('menu.game.marks') }}</span>
    </a-menu-item>
  </a-sub-menu>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { store } from '@/store'
import { CheckOutlined, FileSearchOutlined } from '@ant-design/icons-vue'
import AIconEmpty from '@/components/common/AIconEmpty.vue'

export default defineComponent({
  components: { FileSearchOutlined, CheckOutlined, AIconEmpty },
  setup () {
    // 鼠标双击坐标点对应的元素
    const fileInputElement = ref<HTMLInputElement>()
    // 打开文件选择页面
    const fileSelect = () => fileInputElement.value?.click()
    // 选择的文件发生改变
    const fileChange = () => store.dispatch('fetchFiles', fileInputElement.value?.files)
    // 是否检测文件拖动
    const fileDrag = computed(() => store.state.fileDrag)
    // 切换文件拖放设置
    const toggleFileDrag = () => store.commit('toggleFileDrag')
    // 是否问号标记模式
    const marks = computed(() => store.state.marks)
    // 切换问号标记模式
    const toggleMarks = () => store.commit('toggleMarks')
    // 问号标记模式菜单是否处于不可用状态
    const marksDisabled = computed(() => store.state.gameType === 'Video')

    return { fileInputElement, fileSelect, fileChange, fileDrag, toggleFileDrag, marks, toggleMarks, marksDisabled }
  }
})
</script>
