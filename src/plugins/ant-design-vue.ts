import { App } from 'vue'
import { Button, Dropdown, Menu } from 'ant-design-vue'
import { CheckOutlined } from '@ant-design/icons-vue'

// 组件列表
const components = [
  Button,
  Dropdown,
  Menu,
  Menu.Item,
  Menu.Divider,
  Menu.SubMenu
]

// 图标列表
const icons = [
  CheckOutlined
]

export default (app: App<Element>): void => {
  // 按需引入组件
  for (const component of [...components, ...icons]) {
    app.component(component.name, component)
  }
}
