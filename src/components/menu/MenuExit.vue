<template>
  <a-menu v-if="show" :title="$t('menu.exit.title')" mode="horizontal">
    <a-sub-menu @click="exit">
      <template #title title="test">
        <CloseOutlined />
      </template>
    </a-sub-menu>
  </a-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CloseOutlined } from '@ant-design/icons-vue'

export default defineComponent({
  components: { CloseOutlined },
  setup () {
    const show = self !== top
    const exit = () => {
      // TODO 退出逻辑
      console.log('exit')
    }
    return { show, exit }
  }
})
</script>
