<template>
  <div
    :style="{ backgroundImage: `url(${backgroundUrl})` ,width: 100+'px',height: 100+'px'}"
  ></div>
</template>

<script>
import backgroundUrl from '../assets/face-normal.bmp'

export default {
  data () {
    return {
      backgroundUrl
    }
  }
}
</script>

<style scoped>
.face-normal {
  min-width: 26px;
  height: 26px;
  background-image: url("../assets/face-normal.bmp");
}
</style>
