import { App } from 'vue'
import { Button, Dropdown, Menu } from 'ant-design-vue'
import { CheckOutlined, ExpandAltOutlined, GlobalOutlined, SettingOutlined } from '@ant-design/icons-vue'

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

// 图标列表
const icons = [
  CheckOutlined,
  ExpandAltOutlined,
  GlobalOutlined,
  SettingOutlined
]

export default (app: App<Element>): void => {
  // 按需引入组件
  for (const component of [...components, ...icons]) {
    app.component(component.name, component)
  }
}
