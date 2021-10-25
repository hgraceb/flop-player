<template>
  <div class="fullscreen center">
    <slot />
  </div>
</template>

<style scoped>
/* 全屏容器 */
.fullscreen {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: fixed;
}

/* 元素居中 */
.center {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
