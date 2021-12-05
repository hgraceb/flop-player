<template>
  <!-- stop 是为了兼容 Firefox 93.0 (Windows 64 位)，否则文件还是会在新窗口被打开预览 -->
  <!-- 监听点击事件是为了遮罩在没有自动隐藏时可以手动点击隐藏，如：将文件拖放到页面中但是不释放、页面刷新时移出鼠标 -->
  <screen-center v-if="show" class="mask" @click="dragleave" @dragover.prevent.stop @drop.prevent.stop="drop" @dragleave.prevent.stop="dragleave">
    <h2>{{ $t('common.fileSelect') }}</h2>
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
      // 判断当前是否需要检测文件拖放
      if (!store.state.fileDrag) return
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
