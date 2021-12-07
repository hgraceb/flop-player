<template>
  <table>
    <tr v-for="item in data" :key="item.key">
      <td :title="item.title">{{ item.key }}</td>
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

    // 动态统计数据
    const time = computed(() => store.getters.getRealTime)
    // 可能出现 solvedBBBV 为 0 的情况，如：在属于开空的方块上标雷
    const estRTime = computed(() => solvedBBBV.value > 0 ? time.value * (bbbv.value / solvedBBBV.value) : undefined)
    const stats = computed(() => {
      // 游戏事件索引超出游戏事件总数时按照最后一个游戏事件进行计算
      return store.state.gameEvents[Math.min(store.state.gameEventIndex, store.state.gameEvents.length) - 1]?.stats
    })
    const solvedBBBV = computed(() => stats.value?.solvedBBBV)
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
    const path = computed(() => stats.value?.path)
    const flags = computed(() => stats.value?.flags)

    // 是否使用默认值
    const isDefault = computed(() => time.value <= 0)

    // 扫雷网和（新）国际网对二次计算的值都是四舍五入进行显示，此处也对所有经过二次计算的值都进行四舍五入处理，如：3BV/s
    // 可能与 Arbiter 规则有所不同，如：时间为 20.16 秒、3BV 为 112 时，Arbiter 0.52.3 的 3BV/s 计算结果为 5.55，而四舍五入后为 5.56（使用 toFixed 进行四舍五入可能会不符合预期）
    // 注意不能直接使用 toFixed() 方法进行四舍五入，可能与预期结果不一致，如：0.015.toFixed(2) 的计算结果为 '0.01'，需要先将 0.015 四舍五入为 0.02 再使用 toFixed() 补零
    // 其中四舍五入不能使用类似 Math.round(1.005 * 100) / 100 的方法，因为乘法和除法都可能有问题，如：Chrome 中 1.005 * 100 的结果为 100.49999999999999
    // IOS 数据可能会出现负值，并且没有太大用处，不进行计算和展示，如：RTime = 1 时，计算公式为：(Math.log(bbbv.value) / Math.log(estRTime.value)
    // ZiNi 相关的数据太难算了...暂时不处理，如：Greedy ZiNi、Human ZiNi、ZNE、HZNE、ZNT、HZNT，啥、啥、啥、写的这是啥 (╯‵□′)╯︵ ╧══╧
    const data: Ref<TypeStat[]> = ref([
      {
        key: 'RTime',
        title: 'Real Time',
        value: computed(() => {
          if (isDefault.value) return '0.00 (0)'
          // 因为有默认值，不用考虑当时间 <= 0 时的情况，estRTime 同理
          return `${round(time.value, 3).toFixed(3)} (${Math.floor(time.value) + 1})`
        })
      },
      {
        key: 'Est RTime',
        title: 'Estimated Time: Real Time * (3BV / Solved 3BV)',
        value: computed(() => {
          // 如果 estRTime 值为 null 则返回默认值
          if (isDefault.value || !estRTime.value) return '* (*)'
          return `${round(estRTime.value, 3).toFixed(3)} (${Math.floor(estRTime.value) + 1})`
        })
      },
      {
        key: '3BV',
        title: 'Bechtel\'s Board Benchmark Value',
        value: computed(() => {
          if (isDefault.value) return '*/*'
          return `${solvedBBBV.value}/${bbbv.value}`
        })
      },
      {
        key: '3BV/s',
        title: '3BV / Real Time',
        value: computed(() => {
          if (isDefault.value) return '*'
          return `${round(solvedBBBV.value / time.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'Ops',
        title: 'Openings',
        value: computed(() => {
          if (isDefault.value) return '*/*'
          return `${solvedOps.value}/${openings.value}`
        })
      },
      {
        key: 'Isls',
        title: 'Islands',
        value: computed(() => {
          if (isDefault.value) return '*/*'
          return `${solvedIsls.value}/${islands.value}`
        })
      },
      {
        key: 'Left',
        title: 'Left Clicks',
        value: computed(() => {
          if (isDefault.value) return '0@0'
          return `${leftClicks.value}@${round(leftClicks.value / time.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'Right',
        title: 'Right Clicks',
        value: computed(() => {
          if (isDefault.value) return '0@0'
          return `${rightClicks.value}@${round(rightClicks.value / time.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'Double',
        title: 'Double Clicks',
        value: computed(() => {
          if (isDefault.value) return '0@0'
          return `${doubleClicks.value}@${round(doubleClicks.value / time.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'Cl',
        title: 'Total Clicks',
        value: computed(() => {
          if (isDefault.value) return '0@0'
          return `${clicks.value}@${round(clicks.value / time.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'IOE',
        title: 'Index of Efficiency: Solved 3BV / Total Clicks',
        value: computed(() => {
          if (isDefault.value) return '*'
          return `${round(solvedBBBV.value / clicks.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'ThrP',
        title: 'ThroughPut: 3BV / Effective Clicks',
        value: computed(() => {
          if (isDefault.value) return '*'
          // Minesweeper Arbiter 0.52.3 中默认的计算公式为：BBBVDONE/(TOTALEFF-MISFLAGS-UNFLAGS-MISUNFLAGS){3}，计算结果可能不同
          return `${round(solvedBBBV.value / eClicks.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'Corr',
        title: 'Correctness: Effective Clicks / Total Clicks',
        value: computed(() => {
          if (isDefault.value) return '*'
          // Minesweeper Arbiter 0.52.3 中默认的计算公式为：(TOTALEFF-MISFLAGS-UNFLAGS-MISUNFLAGS)/TOTALCLK{3}，计算结果可能不同
          return `${round(eClicks.value / clicks.value, 3).toFixed(3)}`
        })
      },
      {
        key: 'Path',
        title: 'Euclidean Distance',
        value: computed(() => {
          if (isDefault.value) return '0'
          return round(path.value, 0)
        })
      },
      {
        key: 'Flags',
        title: 'Flags',
        value: computed(() => {
          if (isDefault.value) return '0'
          return flags.value
        })
      },
      {
        key: 'RQP',
        title: 'Rapport Qualité Prix: Estimated Time * (Estimated Time + 1) / 3BV',
        value: computed(() => {
          if (isDefault.value || !estRTime.value) return '*'
          // 按照 time.value * (time.value + 1) / solvedBBBV.value 计算的话会导致计算的值一直是递增的，没有参考意义
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
  min-width: 60px;
  max-width: 60px;
  /* 单元格右侧边框 */
  border-right: 1px solid gray;
}

td:last-child {
  /* 限制单元格宽度 */
  min-width: 70px;
  max-width: 70px;
}

tr:not(:last-child) td {
  /* 单元格底部边框 */
  border-bottom: 1px solid gray;
}
</style>
