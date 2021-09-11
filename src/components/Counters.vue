<template>
  <table>
    <tr v-for="key in Object.keys(results)" :key="key">
      <td>{{ key }}</td>
      <td>{{ results[key] }}</td>
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
    const time = computed(() => Math.min(store.state.gameEvents[store.state.gameEvents.length - 1]?.time || 0, store.state.gameElapsedTime) / 1000)
    // 可能出现 solvedBbbv 为 0 的情况，比如标雷之后开空，时间最大值限制为 999.99
    const estRTime = computed(() => solvedBbbv.value > 0 ? time.value * (bbbv.value / solvedBbbv.value) : 999.99)
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
    // 注意不能使用 toFixed() 方法进行四舍五入，可能与预期结果不一致，如：0.015.toFixed(2) 的计算结果为 '0.01'
    // IOS 数据可能会出现负值，并且没有太大用处，不进行计算和展示，如：RTime = 1 时，计算公式为：(Math.log(bbbv.value) / Math.log(estRTime.value)
    const results: Ref<TypeStat> = ref({
      RTime: computed(() => {
        if (isDefault.value) return '0.00 (0)'
        // 因为有默认值，不用考虑当时间 <= 0 时的情况，estRTime 同理
        return `${round(time.value, 2)} (${Math.floor(time.value) + 1})`
      }),
      'Est RTime': computed(() => {
        if (isDefault.value) return '* (*)'
        // 时间最大值限制为 999
        return `${round(estRTime.value, 2)} (${Math.min(Math.floor(estRTime.value) + 1, 999)})`
      }),
      '3BV': computed(() => {
        if (isDefault.value) return '*/*'
        return `${solvedBbbv.value}/${bbbv.value}`
      }),
      '3BV/s': computed(() => {
        if (isDefault.value) return '*'
        return `${round(solvedBbbv.value / time.value, 2)}`
      }),
      ZiNi: computed(() => {
        if (isDefault.value) return '*@*'
        return `${gZiNi.value}@${round(gZiNi.value / estRTime.value, 2)}`
      }),
      'H.ZiNi': computed(() => {
        if (isDefault.value) return '*@*'
        return `${hZiNi.value}@${round(hZiNi.value / estRTime.value, 2)}`
      }),
      Ops: computed(() => {
        if (isDefault.value) return '*/*'
        return `${solvedOps.value}/${openings.value}`
      }),
      Isls: computed(() => {
        if (isDefault.value) return '*/*'
        return `${solvedIsls.value}/${islands.value}`
      }),
      Left: computed(() => {
        if (isDefault.value) return '0@0'
        return `${leftClicks.value}@${round(leftClicks.value / time.value, 2)}`
      }),
      Right: computed(() => {
        if (isDefault.value) return '0@0'
        return `${rightClicks.value}@${round(rightClicks.value / time.value, 2)}`
      }),
      Double: computed(() => {
        if (isDefault.value) return '0@0'
        return `${doubleClicks.value}@${round(doubleClicks.value / time.value, 2)}`
      }),
      Cl: computed(() => {
        if (isDefault.value) return '0@0'
        return `${clicks.value}@${round(clicks.value / time.value, 2)}`
      }),
      IOE: computed(() => {
        if (isDefault.value) return '*'
        return `${round(solvedBbbv.value / clicks.value, 3)}`
      }),
      ThrP: computed(() => {
        if (isDefault.value) return '*'
        return `${round(solvedBbbv.value / eClicks.value, 3)}`
      }),
      Corr: computed(() => {
        if (isDefault.value) return '*'
        return `${round(eClicks.value / clicks.value, 3)}`
      }),
      ZNE: computed(() => {
        if (isDefault.value) return '*'
        return `${round(gZiNi.value * coeff.value / clicks.value, 3)}`
      }),
      HZNE: computed(() => {
        if (isDefault.value) return '*'
        return `${round(hZiNi.value * coeff.value / clicks.value, 3)}`
      }),
      ZNT: computed(() => {
        if (isDefault.value) return '*'
        return `${round(gZiNi.value * coeff.value / eClicks.value, 3)}`
      }),
      HZNT: computed(() => {
        if (isDefault.value) return '*'
        return `${round(hZiNi.value * coeff.value / eClicks.value, 3)}`
      }),
      Path: computed(() => {
        if (isDefault.value) return '0'
        // TODO 修复只对 MouseMove 事件才计算 Path 的问题
        return path.value
      }),
      Flags: computed(() => {
        if (isDefault.value) return '0'
        return flags.value
      }),
      RQP: computed(() => {
        if (isDefault.value) return '*'
        // 按照 time.value * (time.value + 1) / solvedBbbv.value 计算的话会导致 计算的值一直是递增的，没有参考意义
        return `${round(estRTime.value * (estRTime.value + 1) / bbbv.value, 2)}`
      })
    })

    return { results }
  }
})
</script>

<style scoped>
table {
  display: inline-block;
  font-size: 12px;
  border-collapse: collapse;
  margin: 5px 5px 0 5px;
}

td {
  width: 75px;
  border: 1px solid gray;
}
</style>
