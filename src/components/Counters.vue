<template>
  <table>
    <tr v-for="key in Object.keys(stats)" :key="key">
      <td>{{ key }}</td>
      <td>{{ stats[key] }}</td>
    </tr>
  </table>
</template>

<script lang="ts">
import { computed, defineComponent, ref, Ref } from 'vue'
import { store } from '@/store'

export default defineComponent({
  setup () {
    interface Stat {
      [key: string]: string | number
    }

    const time = computed(() => Math.min(store.state.gameEvents[store.state.gameEvents.length - 1]?.time || 0, store.state.gameElapsedTime) / 1000)
    const bbbv = computed(() => store.state.bbbv)
    const solvedBbbv = computed(() => store.state.solvedBbbv)

    // 扫雷网和（新）国际网对二次计算的值都是四舍五入进行显示，此处也对所有经过二次计算的值都进行四舍五入处理，如：3BV/s
    // 可能与 Arbiter 规则有所不同，如：时间为 20.16 秒、3BV 为 112 时，Arbiter 0.52.3 的 3BV/s 计算结果为 5.55，而四舍五入后为 5.56
    const stats: Ref<Stat> = ref({
      RTime: computed(() => {
        if (time.value <= 0) return '0.00 (0)'
        return `${time.value.toFixed(2)} (${time.value === 0 ? 0 : Math.floor(time.value) + 1})`
      }),
      'Est RTime': computed(() => {
        if (time.value <= 0) return '* (*)'
        const estRTime = time.value * (bbbv.value / solvedBbbv.value)
        return `${estRTime.toFixed(2)} (${estRTime === 0 ? 0 : Math.floor(estRTime) + 1})`
      }),
      '3BV': computed(() => {
        if (time.value <= 0) return '*/*'
        return `${solvedBbbv.value}/${bbbv.value}`
      }),
      '3BV/s': computed(() => {
        if (time.value <= 0) return '*'
        return `${(solvedBbbv.value / time.value).toFixed(2)}`
      }),
      ZiNi: '*@*',
      'H.ZiNi': '*@*',
      Ops: '*/*',
      Isls: '0',
      Left: '0@0',
      Right: '0@0',
      Double: '0@0',
      Cl: '0@0',
      IOE: '*',
      ThrP: '*',
      Corr: '*',
      ZNE: '*',
      HZNE: '*',
      ZNT: '*',
      HZNT: '*',
      Path: '0',
      Flags: '0',
      RQP: '*',
      IOS: '*'
    })

    return { stats }
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
  width: 70px;
  border: 1px solid gray;
}
</style>
