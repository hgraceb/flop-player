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
        // TODO 修复和 Arbiter 计算结果不一致的问题
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
