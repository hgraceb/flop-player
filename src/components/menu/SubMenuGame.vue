<template>
  <a-sub-menu :title="$t('menu.game.title')">
    <a-menu-item :disabled="marksDisabled" @click="toggleMarks">
      <CheckOutlined v-if="marks" />
      <a-icon-empty v-else />
      <span>{{ $t('menu.game.marks') }}</span>
    </a-menu-item>
    <template v-if="showShareLink">
      <a-menu-divider />
      <a-menu-item @click="copyShareLink">
        <CopyOutlined />
        <span>{{ $t('menu.game.share.copy') }}</span>
      </a-menu-item>
      <a-menu-item>
        <ShareAltOutlined />
        <span>
          <a :href="shareLink" target="_blank">{{ $t('menu.game.share.open') }}</a>
        </span>
      </a-menu-item>
    </template>
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
    <a-menu-item v-if="showURI" :title="uri">
      <DownloadOutlined />
      <span>
        <!-- 如果录像 URI 请求成功，则直接在当前页面下载录像，不用打开新的窗口；请求失败则打开新的窗口查看链接，避免点击错误链接导致页面加载出错 -->
        <a :href="uri" :target="`${uriSuccess ? '_self' : '_blank'}`" download>{{ $t('menu.game.download') }}</a>
      </span>
    </a-menu-item>
  </a-sub-menu>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { store } from '@/store'
import { CheckOutlined, CopyOutlined, DownloadOutlined, FileSearchOutlined, ShareAltOutlined } from '@ant-design/icons-vue'
import AIconEmpty from '@/components/common/AIconEmpty.vue'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import copy from 'copy-text-to-clipboard'

export default defineComponent({
  components: { FileSearchOutlined, CheckOutlined, CopyOutlined, DownloadOutlined, ShareAltOutlined, AIconEmpty },
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
    // 分享链接
    const shareLink = computed(() => store.state.shareLink)
    // 复制分享链接，http 协议的网址无法直接使用 navigator.clipboard
    const copyShareLink = () => copy(shareLink.value) ? message.info(t('menu.game.share.copied')) : message.error(t('menu.game.share.error'))
    // 是否展示复制分享链接按钮
    const showShareLink = computed(() => shareLink.value.length > 0)
    // 录像 URI
    const uri = computed(() => store.state.uri)
    // 录像 URI 是否请求成功
    const uriSuccess = computed(() => store.state.uriSuccess)
    // 是否展示 URI 下载按钮
    const showURI = computed(() => uri.value.length > 0)

    return { fileInputElement, fileSelect, fileChange, fileDrag, toggleFileDrag, marks, toggleMarks, marksDisabled, shareLink, copyShareLink, showShareLink, uri, uriSuccess, showURI }
  }
})
</script>
