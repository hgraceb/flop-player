<template>
  <table>
    <tr v-for="item in data" :key="item.key">
      <td :title="item.key">{{ item.key }}</td>
      <td :title="item.value">{{ item.value }}</td>
    </tr>
  </table>
</template>

<script lang="ts">
import { computed, defineComponent, ref, Ref } from 'vue'
import { store } from '@/store'
import { round } from 'number-precision'

export default defineComponent({
  setup () {
    interface TypeStat {
      [key: string]: string | number
    }

    // 静态统计数据
    const bbbv = computed(() => store.state.bbbv)
    const openings = computed(() => store.state.openings)
    const islands = computed(() => store.state.islands)
    const gZiNi = computed(() => store.state.gZiNi)
    const hZiNi = computed(() => store.state.hZiNi)

    // 动态统计数据
    const time = computed(() => {
      // 如果当前是播放录像，则计数器时间最大为最后一个游戏事件的时间
      if (store.state.gameType === 'Video') {
        return Math.min(store.state.gameEvents[store.state.gameEvents.length - 1]?.time || 0, store.state.gameElapsedTime) / 1000
      }
      return store.state.gameElapsedTime / 1000
    })
    // 可能出现 solvedBbbv 为 0 的情况，比如标雷之后开空
    const estRTime = computed(() => solvedBbbv.value > 0 ? time.value * (bbbv.value / solvedBbbv.value) : null)
    const stats = computed(() => {
      // 游戏事件索引超出游戏事件总数时按照最后一个游戏事件进行计算
      return store.state.gameEvents[Math.min(store.state.gameEventIndex, store.state.gameEvents.length) - 1]?.stats
    })
    const solvedBbbv = computed(() => stats.value?.solvedBbbv)
    const solvedOps = computed(() => stats.value?.solvedOps)
    const solvedIsls = computed(() => stats.value?.solvedIsls)
    const leftClicks = computed(() => stats.value?.leftClicks)
    const rightClicks = computed(() => stats.value?.rightClicks)
    const doubleClicks = computed(() => stats.value?.doubleClicks)
    const clicks = computed(() => leftClicks.value + rightClicks.value + doubleClicks.value)
    const wastedLeftClicks = computed(() => stats.value?.wastedLeftClicks)
    const wastedRightClicks = computed(() => stats.value?.wastedRightClicks)
    const wastedDoubleClicks = computed(() => stats.value?.wastedDoubleClicks)
    const wastedClicks = computed(() => wastedLeftClicks.value + wastedRightClicks.value + wastedDoubleClicks.value)
    // 有效点击次数，所有改变当前雷局局面的点击计算为一次有效点击
    const eClicks = computed(() => clicks.value - wastedClicks.value)
    const coeff = computed(() => solvedBbbv.value / bbbv.value)
    const path = computed(() => stats.value?.path)
    const flags = computed(() => stats.value?.flags)

    // 是否使用默认值
    const isDefault = computed(() => time.value <= 0)

    // 扫雷网和（新）国际网对二次计算的值都是四舍五入进行显示，此处也对所有经过二次计算的值都进行四舍五入处理，如：3BV/s
    // 可能与 Arbiter 规则有所不同，如：时间为 20.16 秒、3BV 为 112 时，Arbiter 0.52.3 的 3BV/s 计算结果为 5.55，而四舍五入后为 5.56（使用 toFixed 进行四舍五入可能会不符合预期）
    // 注意不能直接使用 toFixed() 方法进行四舍五入，可能与预期结果不一致，如：0.015.toFixed(2) 的计算结果为 '0.01'，需要先将 0.015 四舍五入为 0.02 再使用 toFixed() 补零
    // 其中四舍五入不能使用类似 Math.round(1.005 * 100) / 100 的方法，因为乘法和除法都可能有问题，如：Chrome 中 1.005 * 100 的结果为 100.49999999999999
    // IOS 数据可能会出现负值，并且没有太大用处，不进行计算和展示，如：RTime = 1 时，计算公式为：(Math.log(bbbv.value) / Math.log(estRTime.value)
    const data: Ref<TypeStat[]> = ref([
      {
        key: 'RTime',
        value: computed(() => {
          if (isDefault.value) return '0.00 (0)'
          // 因为有默认值，不用考虑当时间 <= 0 时的情况，estRTime 同理
          return `${round(time.value, 3).toFixed(3)} (${Math.floor(time.value) + 1})`
        })
      },
      {
        key: 'Est RTime',
        value: computed(() => {
          // 如果 estRTime 值为 null 则返回默认值
          if (isDefault.value || !estRTime.value) return '* (*)'
          return `${round(estRTime.value, 3).toFixed(3)} (${Math.floor(estRTime.value) + 1})`
        })
      },
      {
        key: '3BV',
        value: computed(() => {
          if (isDefault.value) return '*/*'
          return `${solvedBbbv.value}/${bbbv.value}`
        })
      },
      {
        key: '3BV/s',
        value: computed(() => {
          if (isDefault.value) return '*'
          return `${round(solvedBbbv.value / time.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'ZiNi',
        value: computed(() => {
          if (isDefault.value || !estRTime.value) return '*@*'
          return `${gZiNi.value}@${round(gZiNi.value / estRTime.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'H.ZiNi',
        value: computed(() => {
          if (isDefault.value || !estRTime.value) return '*@*'
          return `${hZiNi.value}@${round(hZiNi.value / estRTime.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'Ops',
        value: computed(() => {
          if (isDefault.value) return '*/*'
          return `${solvedOps.value}/${openings.value}`
        })
      },
      {
        key: 'Isls',
        value: computed(() => {
          if (isDefault.value) return '*/*'
          return `${solvedIsls.value}/${islands.value}`
        })
      },
      {
        key: 'Left',
        value: computed(() => {
          if (isDefault.value) return '0@0'
          return `${leftClicks.value}@${round(leftClicks.value / time.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'Right',
        value: computed(() => {
          if (isDefault.value) return '0@0'
          return `${rightClicks.value}@${round(rightClicks.value / time.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'Double',
        value: computed(() => {
          if (isDefault.value) return '0@0'
          return `${doubleClicks.value}@${round(doubleClicks.value / time.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'Cl',
        value: computed(() => {
          if (isDefault.value) return '0@0'
          return `${clicks.value}@${round(clicks.value / time.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'IOE',
        value: computed(() => {
          if (isDefault.value) return '*'
          return `${round(solvedBbbv.value / clicks.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'ThrP',
        value: computed(() => {
          if (isDefault.value) return '*'
          return `${round(solvedBbbv.value / eClicks.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'Corr',
        value: computed(() => {
          if (isDefault.value) return '*'
          return `${round(eClicks.value / clicks.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'ZNE',
        value: computed(() => {
          if (isDefault.value) return '*'
          return `${round(gZiNi.value * coeff.value / clicks.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'HZNE',
        value: computed(() => {
          if (isDefault.value) return '*'
          return `${round(hZiNi.value * coeff.value / clicks.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'ZNT',
        value: computed(() => {
          if (isDefault.value) return '*'
          return `${round(gZiNi.value * coeff.value / eClicks.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'HZNT',
        value: computed(() => {
          if (isDefault.value) return '*'
          return `${round(hZiNi.value * coeff.value / eClicks.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'Path',
        value: computed(() => {
          if (isDefault.value) return '0'
          // TODO 修复只对 MouseMove 事件才计算 Path 的问题
          return path.value
        })
      },
      {
        key: 'Flags',
        value: computed(() => {
          if (isDefault.value) return '0'
          return flags.value
        })
      },
      {
        key: 'RQP',
        value: computed(() => {
          if (isDefault.value || !estRTime.value) return '*'
          // 按照 time.value * (time.value + 1) / solvedBbbv.value 计算的话会导致 计算的值一直是递增的，没有参考意义
          return `${round(estRTime.value * (estRTime.value + 1) / bbbv.value, 3).toFixed(3)}`
        })
      }
    ])

    return { data }
  }
})
</script>

<style scoped>
/* 表格整体样式 */
table {
  /* 表格背景颜色，与底部和右侧边框颜色一样，避免部分缩放比例下显示白边，不过顶部和左侧可能会有一点灰边，这是特性（确信） <(￣︶￣)>✧ */
  background-color: rgb(160, 160, 160);
  /* 表格边框 */
  border: 3px solid rgb(255, 255, 255);
  border-right-color: rgb(160, 160, 160);
  border-bottom-color: rgb(160, 160, 160);
  /* 使用分割模式实现共享边框的效果，避免 Chrome 部分缩放比例下边框粗细不一致的问题 */
  border-collapse: separate;
  border-spacing: 0;
}

/* 表格数据单元行样式 */
tr {
  background-color: rgb(192, 192, 192);
}

/* 表格数据单元行悬浮样式 */
tr:hover {
  background-color: rgb(224, 224, 224);
}

/* 表格数据单元格样式 */
td {
  font-size: 12px;
  /* 用省略号表示被截断的文本 */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

td:first-child {
  /* 限制单元格宽度 */
  min-width: 70px;
  max-width: 70px;
  /* 单元格右侧边框 */
  border-right: 1px solid gray;
}

td:last-child {
  /* 限制单元格宽度 */
  min-width: 80px;
  max-width: 80px;
}

tr:not(:last-child) td {
  /* 单元格底部边框 */
  border-bottom: 1px solid gray;
}
</style>
