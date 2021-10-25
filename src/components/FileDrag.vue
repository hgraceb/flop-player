<template>
  <!-- TODO 翻译文件拖拽处理可能展示的所有提示和错误信息 -->
  <!-- stop 是为了兼容 Firefox 93.0 (64 位)，否则文件还是会在新窗口被打开预览 -->
  <screen-center v-if="show" class="mask" @dragover.prevent.stop @drop.prevent.stop="drop" @dragleave.prevent.stop="dragleave">
    <h1>拖拽到这里上传</h1>
  </screen-center>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import ScreenCenter from '@/components/common/ScreenCenter.vue'

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
      if (e.dataTransfer?.files.length !== 1) {
        message.error('请选择一个 .rawvf 文件')
        return
      }
      const file = e.dataTransfer.files[0]
      // 获取文件扩展名，连小数点一起获取是为了避免文件全名与扩展名一样导致判断错误
      const extension = file.name.substring(file.name.lastIndexOf('.'))
      if (extension === '.rawvf') {
        message.info(`type = ${extension}`)
      } else {
        message.error('文件扩展名错误')
      }
    }

    // 检测到有元素被拖动进当前窗口时触发遮罩显示，其他事件由遮罩内部自行处理和判断
    const dragenter = () => {
      // 不显示滚动条，避免元素拖动到滚动条上，导致可能没有触发 dragleave 事件或者页面内元素进行滚动
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
  /* 不作为鼠标事件的目标，避免拖动事件判断出错 */
  pointer-events: none;
}

/* 提示文本的一级标题 */
h1 {
  position: absolute;
  /* 覆盖外边距 */
  margin: 0 !important;
  /* 覆盖文本颜色 */
  color: white !important;
}
</style>
