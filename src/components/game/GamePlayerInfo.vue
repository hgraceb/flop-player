<template>
  <g :transform="`translate(90 ${height - 250})`">
    <path :d="`M 0 0 h ${width - 180} v 160 h ${180 - width} Z`" fill="#e0e0e0" />
    <foreignObject :width="width - 180" height="160">
      <div :style="`opacity: ${opacityPlayer}`" :title="player" class="player-name">{{ player }}</div>
    </foreignObject>
  </g>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { store } from '@/store'
import chardet from 'chardet'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  props: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  setup () {
    const { t } = useI18n()
    // 从原始字节数据解码得到的玩家名称
    const playerDecoded = computed(() => {
      // TODO 提供更多的编码格式进行自定义选择，可以分类为自动、常用、中文、英语、日语...
      // 自动检测玩家姓名的编码格式，经过测试 Windows-1252 可以兼容目前较多的已有录像数据，默认使用 Windows-1252 编码格式
      try {
        // 部分编码格式无法使用 TextDecoder 进行解析，如：UTF-32LE
        // 所有可能返回的编码参见：https://github.com/runk/node-chardet
        // 所有的有效编码格式参见：https://developer.mozilla.org/en-US/docs/Web/API/Encoding_API/Encodings
        return new TextDecoder(chardet.detect(store.state.playerArray) || 'Windows-1252').decode(store.state.playerArray).trim()
      } catch {
        // 解析出错则使用默认编码格式重新进行解析
        return new TextDecoder('Windows-1252').decode(store.state.playerArray).trim()
      }
    })
    // 玩家名称
    const player = computed(() => {
      // 没有玩家姓名信息则显示默认值
      return playerDecoded.value.length > 0 ? playerDecoded.value : t('game.anonymous')
    })
    // 玩家名称的文本不透明度
    const opacityPlayer = computed(() => {
      // 没有玩家姓名信息则置灰显示
      return playerDecoded.value.length > 0 ? 1 : 0.25
    })
    return { player, opacityPlayer }
  }
})
</script>

<style scoped>
.player-name {
  overflow: hidden;
  font-size: 100px;
  text-align: center;
  /* 设置 white-space 属性，避免文本换行 */
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
