import { App } from 'vue'

export default (app: App<Element>): void => {
  // 全局配置，https://element-plus.gitee.io/#/zh-CN/component/quickstart
  app.config.globalProperties.$ELEMENT = {
    size: 'small'
  }
  // 按需引入，https://element-plus.gitee.io/#/zh-CN/component/quickstart
  // app.use(ElButton)
}
