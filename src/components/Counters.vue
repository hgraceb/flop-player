<template>
  <table>
    <tr v-for="key in Object.keys(stats)" :key="key">
      <td>{{ key }}</td>
      <td>{{ stats[key].value || stats[key].default }}</td>
    </tr>
  </table>
</template>

<script lang="ts">
import { computed, defineComponent, ref, Ref, watch } from 'vue'
import { store } from '@/store'

export default defineComponent({
  setup () {
    interface Stat {
      [key: string]: {
        default: string,
        value?: string
      }
    }

    const stats: Ref<Stat> = ref({
      RTime: {
        default: '0.00 (0)'
      },
      'Est RTime': {
        default: '* (*)'
      },
      '3BV': {
        default: '*/*'
      },
      '3BV/s': {
        default: '*/*'
      },
      ZiNi: {
        default: '*@*'
      },
      'H.ZiNi': {
        default: '*@*'
      },
      Ops: {
        default: '*/*'
      },
      Isls: {
        default: '0'
      },
      Left: {
        default: '0@0'
      },
      Right: {
        default: '0@0'
      },
      Double: {
        default: '0@0'
      },
      Cl: {
        default: '0@0'
      },
      IOE: {
        default: '*'
      },
      ThrP: {
        default: '*'
      },
      Corr: {
        default: '*'
      },
      ZNE: {
        default: '*'
      },
      HZNE: {
        default: '*'
      },
      ZNT: {
        default: '*'
      },
      HZNT: {
        default: '*'
      },
      Path: {
        default: '0'
      },
      Flags: {
        default: '0'
      },
      RQP: {
        default: '*'
      },
      IOS: {
        default: '*'
      }
    })

    watch(computed(() => store.state.gameElapsedTime), () => {
      const time = Math.min(store.state.gameEvents[store.state.gameEvents.length - 1]?.time || 0, store.state.gameElapsedTime) / 1000
      stats.value.RTime.value = `${time.toFixed(2)} (${time === 0 ? 0 : Math.floor(time) + 1})`
    })

    return { stats }
  }
})
</script>

<style scoped>
table {
  display: inline-block;
  font-size: 12px;
}
</style>
