import { App } from 'vue'
import { Button, Dropdown, Menu } from 'ant-design-vue'

// 组件列表
const components = [
  // 按钮
  Button,
  // 下拉菜单
  Dropdown,
  Menu,
  Menu.Item,
  Menu.Divider,
  Menu.SubMenu
]

export default (app: App<Element>): void => {
  // 按需引入组件，不能在此处引入图标，否则打包之后无法正常显示，需要在对应的组件中直接进行引用
  for (const component of components) {
    app.component(component.name, component)
  }
}
