<template>
  <div class="flex border-box top-counter">
    <div :class="'count-' + hun"/>
    <div :class="'count-' + ten"/>
    <div :class="'count-' + one"/>
  </div>
</template>

<script setup lang="ts">
import {computed, toRefs} from 'vue';

const props = defineProps({
  // 需要显示的值
  count: {
    type: Number,
    required: true
  },
  // 最小值
  min: {
    type: Number,
    default: Number.MIN_SAFE_INTEGER
  }
})

const {count, min} = toRefs(props)

// 实际显示的值，最大只显示999
const value = computed((): number => {
  return Math.min(Math.max(count.value, min!!.value), 999)
})

// 百位数的值
const hun = computed((): number | string => {
  // 显示的值为负数时，最多只显示两位数字，百位数显示负号
  if (value.value < 0) {
    return 'minus'
  }
  return Math.floor(Math.abs(value.value) / 100) % 10
})

// 十位数的值
const ten = computed((): number => {
  return Math.floor(Math.abs(value.value) / 10) % 10
})

// 个位数的值
const one = computed((): number => {
  return Math.abs(value.value) % 10
})
</script>

<style scoped>
.top-counter {
  min-width: 41px;
  height: 25px;
  padding: 1px;
  background-image: url("../assets/top-counters.bmp");
}

div[class*='count-'] {
  width: 11px;
  height: 21px;
  margin: 1px;
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
