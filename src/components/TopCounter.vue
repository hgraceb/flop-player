<template>
  <div class="flex container border-box">
    <div :class="'count-' + hun"></div>
    <div :class="'count-' + ten"></div>
    <div :class="'count-' + one"></div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'TopCounter',
  props: {
    count: {
      type: Number,
      required: true
    }
  },
  computed: {
    // 百位数的值
    hun: function () {
      if (this.count >= 999) {
        return 9
      }
      if (this.count < 0) {
        return 'minus'
      }
      return parseInt(Math.abs(this.count) / 100) % 10
    },
    // 十位数的值
    ten: function () {
      if (this.count >= 999) {
        return 9
      }
      return parseInt((Math.abs(this.count) / 10)) % 10
    },
    // 个位数的值
    one: function () {
      if (this.count >= 999) {
        return 9
      }
      return Math.abs(this.count) % 10
    }
  }
})
</script>

<style scoped>
.container {
  min-width: 41px;
  height: 25px;
  padding-top: 2px;
  background-image: url("../assets/top-counters.bmp");
}

div[class*='count-'] {
  width: 11px;
  height: 21px;
  margin-left: 2px;
}

.count-minus {
  background-image: url("../assets/count-minus.bmp");
}

.count-0 {
  background-image: url("../assets/count-0.bmp");
}

.count-1 {
  background-image: url("../assets/count-1.bmp");
}

.count-2 {
  background-image: url("../assets/count-2.bmp");
}

.count-3 {
  background-image: url("../assets/count-3.bmp");
}

.count-4 {
  background-image: url("../assets/count-4.bmp");
}

.count-5 {
  background-image: url("../assets/count-5.bmp");
}

.count-6 {
  background-image: url("../assets/count-6.bmp");
}

.count-7 {
  background-image: url("../assets/count-7.bmp");
}

.count-8 {
  background-image: url("../assets/count-8.bmp");
}

.count-9 {
  background-image: url("../assets/count-9.bmp");
}
</style>
