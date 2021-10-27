<template>
  <!-- TODO 翻译文件拖放处理可能展示的所有提示和错误信息 -->
  <!-- stop 是为了兼容 Firefox 93.0 (64 位)，否则文件还是会在新窗口被打开预览 -->
  <screen-center v-if="show" class="mask" @dragover.prevent.stop @drop.prevent.stop="drop" @dragleave.prevent.stop="dragleave">
    <!-- TODO 添加其他类型文件的选择说明 -->
    <h2>{{ $t('common.fileSelect', ['rawvf']) }}</h2>
  </screen-center>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import ScreenCenter from '@/components/common/ScreenCenter.vue'
import { store } from '@/store'

export default defineComponent({
  components: { ScreenCenter },
  setup () {
    // 裁剪元素框外内容对应的全局样式名称
    const classHidden = 'overflow-hidden'
    const show = ref(false)
    const dragleave = () => {
      // 重新显示滚动条
      document.body.classList.remove(classHidden)
      show.value = false
    }
    const drop = (e: DragEvent) => {
      // 模拟 dragleave 事件
      dragleave()
      store.dispatch('fetchFiles', e.dataTransfer?.files)
    }

    // 检测到有元素被拖放进当前窗口时触发遮罩显示，其他事件由遮罩内部自行处理和判断
    const dragenter = () => {
      // 不显示滚动条，避免元素拖放到滚动条上，导致可能没有触发 dragleave 事件或者页面内元素进行滚动
      document.body.classList.add(classHidden)
      show.value = true
    }
    // 向当前窗口注册和删除监听器，不在 document.body 注册是因为 Firefox 93.0 (64 位) 有滚动条时，滚动条不会触发 dragenter 事件
    onMounted(() => document.addEventListener('dragenter', dragenter))
    onUnmounted(() => document.removeEventListener('dragenter', dragenter))

    return { show, dragleave, drop }
  }
})
</script>

<style scoped>
/* 遮罩 */
.mask {
  /* Ant Design Vue 的控件有的堆叠层级会达到 1000+，遮罩使用 9999 是为了保证显示在顶层 */
  z-index: 9999;
  background: rgba(0, 0, 0, .7);
}

.mask * {
  /* 不作为鼠标事件的目标，避免拖放事件判断出错 */
  pointer-events: none;
}

/* 提示文本的一级标题 */
h2 {
  position: absolute;
  /* 覆盖外边距 */
  margin: 0 !important;
  /* 覆盖文本颜色 */
  color: white !important;
}
</style>
