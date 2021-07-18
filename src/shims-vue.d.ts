/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

/* 图片 */
declare module '*.bmp' {
  const src: string
  export default src
}
