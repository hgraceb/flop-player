<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <!-- 背景颜色，用于修正部分缩放比例下有白边的问题，7.89 是为了填充游戏区域顶部和左侧与边框之前的白边，也是为了尽量不影响正常的图片显示，此元素不能放到方块容器外面，否则无法生效 -->
    <path :d="`M -7.89 -7.89 h ${gameWidth * 160 + 7.89} v 15.78 h ${gameWidth * -160 + 7.89} v ${gameHeight * 160 - 7.89} h -15.78 Z`" fill="gray" />
    <template v-for="(item, height) in gameHeight" :key="item">
      <skin-symbol
        v-for="(item, width) in gameWidth"
        :key="item"
        :ref="el => { if (el) cells[width + height * gameWidth] = el.$el }"
        :name="getCellImg(width, height)"
        :onmousedown="cellMouseHandler"
        :onmousemove="cellMouseHandler"
        :onmouseup="cellMouseHandler"
        :translate-x="getTranslateX(width)"
        :translate-y="getTranslateY(height)"
      />
    </template>
  </g>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { store } from '@/store'
import SkinSymbol from '@/components/skin/SkinSymbol.vue'
import { CELL_SIDE_LENGTH, GAME_MIDDLE, GAME_TOP_LOWER, GAME_TOP_MIDDLE, GAME_TOP_UPPER, SVG_SCALE } from '@/game/constants'
import { ImgCellType } from '@/util/image'
import { round } from 'number-precision'
import { useThrottleFn } from '@vueuse/core'

export default defineComponent({
  components: { SkinSymbol },
  setup () {
    // 游戏棋盘整体的 X 轴坐标偏移量
    const translateX = (GAME_MIDDLE.widthLeft) * SVG_SCALE
    // 游戏棋盘整体的 Y 轴坐标偏移量
    const translateY = (GAME_TOP_UPPER.height + GAME_TOP_MIDDLE.height + GAME_TOP_LOWER.height) * SVG_SCALE
    // 游戏宽度
    const gameWidth = computed(() => store.state.width)
    // 游戏高度
    const gameHeight = computed(() => store.state.height)
    // 根据横坐标和纵坐标获取方块的图片名称
    const getCellImg = (width: number, height: number): ImgCellType => {
      // 如果游戏棋盘信息为空，则返回默认值
      if (store.state.gameImgBoard.length === 0) {
        return 'cell-normal'
      }
      return store.state.gameImgBoard[width + height * gameWidth.value]
    }
    // 根据横坐标获取 X 轴坐标偏移量
    const getTranslateX = (width: number): number => {
      return width * CELL_SIDE_LENGTH * SVG_SCALE
    }
    // 根据纵坐标获取 Y 轴坐标偏移量
    const getTranslateY = (height: number): number => {
      return height * CELL_SIDE_LENGTH * SVG_SCALE
    }
    // 当前 X 坐标
    const curX = ref(0)
    // 当前 Y 坐标
    const curY = ref(0)
    // 棋盘方块对应的元素数组
    const cells = ref<(SVGUseElement | undefined)[]>([])
    // 添加鼠标事件，做节流处理，避免采样率过高导致游戏有卡顿感，按 1 秒 60 帧算，4 毫秒大概是 1/4 帧
    const pushMouseMove = useThrottleFn(() => {
      store.commit('pushUserEvent', { mouse: 'mv', x: curX.value, y: curY.value })
    }, 4)
    // 添加鼠标事件
    const pushEvent = (e: MouseEvent) => {
      // 阻止捕获和冒泡阶段中当前事件的进一步传播
      e.stopPropagation()
      if (e.type === 'mousemove') {
        pushMouseMove()
      } else if (e.type === 'mousedown' && e.button === 0 && e.shiftKey) {
        store.commit('pushUserEvent', { mouse: 'sc', x: curX.value, y: curY.value })
      } else if (e.type === 'mousedown' && e.button === 0) {
        store.commit('pushUserEvent', { mouse: 'lc', x: curX.value, y: curY.value })
      } else if (e.type === 'mousedown' && e.button === 1) {
        store.commit('pushUserEvent', { mouse: 'mc', x: curX.value, y: curY.value })
      } else if (e.type === 'mousedown' && e.button === 2) {
        store.commit('pushUserEvent', { mouse: 'rc', x: curX.value, y: curY.value })
      } else if (e.type === 'mouseup' && e.button === 0) {
        store.commit('pushUserEvent', { mouse: 'lr', x: curX.value, y: curY.value })
      } else if (e.type === 'mouseup' && e.button === 1) {
        store.commit('pushUserEvent', { mouse: 'mr', x: curX.value, y: curY.value })
      } else if (e.type === 'mouseup' && e.button === 2) {
        store.commit('pushUserEvent', { mouse: 'rr', x: curX.value, y: curY.value })
      }
    }
    // 处理方块的鼠标事件
    const cellMouseHandler = (e: MouseEvent) => {
      // 如果当前玩家未开始游戏或者事件的当前目标类型不属于指定类型
      if (!store.getters.isUserPlaying || !(e.currentTarget instanceof SVGUseElement)) return
      const index = cells.value.indexOf(e.currentTarget)
      // 如果方块元素数组没有对应的元素或者元素超出游戏区域
      if (index < 0 || index > store.state.width * store.state.height) return
      // 获取被点击方块的位置信息
      const rect = e.currentTarget.getBoundingClientRect()
      // 被点击方块所在列
      const column = index % store.state.width
      // 被点击方块所在行
      const row = Math.floor(index / store.state.width)
      // 在方块上点击时，将横坐标和纵坐标限制在方块区域内，因为原始数据可能已经被四舍五入过，点击边缘位置时计算得到的值可能超出实际方块范围
      curX.value = column * CELL_SIDE_LENGTH + Math.max(0, Math.min(round(e.x - rect.x, 0), CELL_SIDE_LENGTH - 1))
      curY.value = row * CELL_SIDE_LENGTH + Math.max(0, Math.min(round(e.y - rect.y, 0), CELL_SIDE_LENGTH - 1))
      pushEvent(e)
    }
    // 处理其他区域的鼠标事件
    const otherMouseHandler = (e: MouseEvent) => {
      // 如果当前玩家未开始游戏或者首个方块没有被渲染
      if (!store.getters.isUserPlaying || !cells.value[0]) return
      // 获取左上角首个方块的位置信息
      const rect = cells.value[0].getBoundingClientRect()
      const width = store.state.width * CELL_SIDE_LENGTH
      const height = store.state.height * CELL_SIDE_LENGTH
      curX.value = round(e.x - rect.x, 0)
      curY.value = round(e.y - rect.y, 0)
      // 在方块区域外点击但是计算结果却在方块区域内时，将横坐标和纵坐标限制在方块区域外
      if (curX.value > -1 && curX.value < width && curY.value > -1 && curY.value < height) {
        // 取临近的方块区域外边缘坐标点
        curX.value = curX.value < width / 2 ? -1 : width
        curY.value = curY.value < height / 2 ? -1 : height
      }
      pushEvent(e)
    }
    onMounted(() => {
      document.addEventListener('mousemove', otherMouseHandler)
      document.addEventListener('mousedown', otherMouseHandler)
      document.addEventListener('mouseup', otherMouseHandler)
    })
    onUnmounted(() => {
      document.removeEventListener('mousemove', otherMouseHandler)
      document.removeEventListener('mousedown', otherMouseHandler)
      document.removeEventListener('mouseup', otherMouseHandler)
    })
    // 切换问号标记模式时添加对应的游戏事件，坐标使用前一个事件的坐标
    watch(computed(() => store.state.marks), () => store.commit('pushUserEvent', { mouse: 'mt', x: curX.value, y: curY.value }))

    return { translateX, translateY, gameWidth, gameHeight, getCellImg, getTranslateX, getTranslateY, cells, cellMouseHandler }
  }
})
</script>
