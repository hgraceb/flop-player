<template>
  <a-sub-menu :title="$t('menu.game.title')">
    <a-menu-item :disabled="marksDisabled" @click="toggleMarks">
      <CheckOutlined v-if="marks" />
      <a-icon-empty v-else />
      <span>{{ $t('menu.game.marks') }}</span>
    </a-menu-item>
    <a-menu-divider />
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
    <template v-if="showShareLink">
      <a-menu-divider />
      <a-menu-item @click="copyShareLink">
        <ShareAltOutlined />
        <span>{{ $t('menu.game.share.title') }}</span>
      </a-menu-item>
    </template>
  </a-sub-menu>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { store } from '@/store'
import { CheckOutlined, FileSearchOutlined, ShareAltOutlined } from '@ant-design/icons-vue'
import AIconEmpty from '@/components/common/AIconEmpty.vue'
import { useClipboard } from '@vueuse/core'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: { FileSearchOutlined, CheckOutlined, ShareAltOutlined, AIconEmpty },
  setup () {
    const { t } = useI18n()
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
    // 复制分享链接
    const copyShareLink = () => {
      // 没测试到复制失败的情况，姑且写着
      useClipboard().copy(store.state.shareLink)
        .then(() => message.info(t('menu.game.share.copied')))
        .catch(() => message.error(t('menu.game.share.error')))
    }
    // 是否展示复制分享链接按钮
    const showShareLink = computed(() => store.state.shareLink.length > 0)

    return { fileInputElement, fileSelect, fileChange, fileDrag, toggleFileDrag, marks, toggleMarks, marksDisabled, copyShareLink, showShareLink }
  }
})
</script>
