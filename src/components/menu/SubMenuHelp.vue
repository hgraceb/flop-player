<template>
  <a-sub-menu :title="$t('menu.help.title')">
    <!-- 源代码 -->
    <a-menu-item :title="urlSource">
      <GithubOutlined />
      <span>
        <a :href="urlSource" download target="_blank">{{ $t('menu.help.source') }}</a>
      </span>
    </a-menu-item>
    <!-- 问题反馈 -->
    <a-menu-item :title="urlBugs">
      <BugOutlined />
      <span>
        <a :href="urlBugs" download target="_blank">{{ $t('menu.help.bugs') }}</a>
      </span>
    </a-menu-item>
    <!-- 版本信息 -->
    <a-menu-item :title="versionInfo" @click="copyVersionInfo">
      <PartitionOutlined />
      <span>{{ $t('menu.help.version') }}</span>
    </a-menu-item>
    <!-- 作者 -->
    <a-sub-menu :title="$t('menu.help.author.title')">
      <template #icon>
        <UserOutlined />
      </template>
      <a-menu-item :title="urlBlog">
        <ReadOutlined />
        <span>
          <a :href="urlBlog" download target="_blank">{{ $t('menu.help.author.blog') }}</a>
        </span>
      </a-menu-item>
      <a-menu-item :title="urlDomain">
        <IdcardOutlined />
        <span>
          <a :href="urlDomain" download target="_blank">{{ $t('menu.help.author.domain') }}</a>
        </span>
      </a-menu-item>
    </a-sub-menu>
  </a-sub-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { BugOutlined, GithubOutlined, IdcardOutlined, PartitionOutlined, ReadOutlined, UserOutlined } from '@ant-design/icons-vue'
import copy from 'copy-text-to-clipboard'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: { GithubOutlined, UserOutlined, PartitionOutlined, IdcardOutlined, ReadOutlined, BugOutlined },
  setup () {
    const { t } = useI18n()
    // 源代码链接
    const urlSource = 'https://github.com/hgraceb/flop-player'
    // 问题反馈链接
    const urlBugs = 'https://github.com/hgraceb/flop-player/issues'
    // 版本信息
    const versionInfo = '1.0.0'
    // 复制版本信息
    const copyVersionInfo = () => copy(versionInfo) ? message.info(t('common.copied', [versionInfo])) : message.error(t('error.copy', [versionInfo]))
    // 我的博客链接
    const urlBlog = 'https://hgraceb.github.io'
    // 我的地盘链接
    const urlDomain = 'http://www.saolei.wang/Player/Index.asp?Id=14512'
    return { urlSource, urlBugs, versionInfo, copyVersionInfo, urlBlog, urlDomain }
  }
})
</script>
