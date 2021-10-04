import { VuexStore } from '@/store/index'
import { useStorage } from '@vueuse/core'

export const STORAGE_KEY = 'flop-mine-locale-storage'

/**
 * 本地缓存默认值
 */
export const storageDefault = {
  // 页面缩放值
  scale: 1,
  // 游戏速度
  gameSpeed: 1.0,
  // 是否显示鼠标轨迹图
  isMousePath: false,
  // 是否显示鼠标移动轨迹图
  isMousePathMove: true,
  // 是否显示鼠标左键散点图
  isMousePathLeft: true,
  // 是否显示鼠标右键散点图
  isMousePathRight: true,
  // 是否显示鼠标双击散点图
  isMousePathDouble: true
}

/**
 * 获取本地缓存的变量值
 */
export const storage = useStorage(STORAGE_KEY, storageDefault)

/**
 * 本地缓存插件，响应式更新本地缓存
 */
const localStoragePlugin = (store: VuexStore) => {
  store.watch(state => state.scale, value => {
    storage.value.scale = value
  })
  store.watch(state => state.gameSpeed, value => {
    storage.value.gameSpeed = value
  })
  store.watch(state => state.isMousePath, value => {
    storage.value.isMousePath = value
  })
  store.watch(state => state.isMousePathMove, value => {
    storage.value.isMousePathMove = value
  })
  store.watch(state => state.isMousePathLeft, value => {
    storage.value.isMousePathLeft = value
  })
  store.watch(state => state.isMousePathRight, value => {
    storage.value.isMousePathRight = value
  })
  store.watch(state => state.isMousePathDouble, value => {
    storage.value.isMousePathDouble = value
  })
}

export default [localStoragePlugin]
