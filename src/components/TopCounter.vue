<template>
  <div class="flex border-box top-counter">
    <div :class="'count-' + hun" />
    <div :class="'count-' + ten" />
    <div :class="'count-' + one" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
  props: {
    // 需要显示的值
    count: {
      type: Number,
      required: true
    },
    // 最小值
    min: {
      type: Number,
      required: false,
      default: Number.MIN_SAFE_INTEGER
    }
  },
  setup (props) {
    // 实际显示的值，最大只显示999
    const value = computed((): number => {
      return Math.min(Math.max(props.count, props.min), 999)
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

    return { hun, ten, one }
  }
})
</script>

<style scoped>
.top-counter {
  width: 41px;
  height: 25px;
  padding: 1px;
  background-image: var(--top-counters);
  background-size: 100% 100%;
}

div[class*='count-'] {
  width: 11px;
  height: 21px;
  margin: 1px;
  background-size: 100% 100%;
}

.count-minus {
  background-image: var(--count-minus);
}

.count-0 {
  background-image: var(--count-0);
}

.count-1 {
  background-image: var(--count-1);
}

.count-2 {
  background-image: var(--count-2);
}

.count-3 {
  background-image: var(--count-3);
}

.count-4 {
  background-image: var(--count-4);
}

.count-5 {
  background-image: var(--count-5);
}

.count-6 {
  background-image: var(--count-6);
}

.count-7 {
  background-image: var(--count-7);
}

.count-8 {
  background-image: var(--count-8);
}

.count-9 {
  background-image: var(--count-9);
}
</style>
