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
  gameSpeed: 1.0
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
}

export default [localStoragePlugin]
