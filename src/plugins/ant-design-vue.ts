import { App } from 'vue'
import { Button, Dropdown, Menu, Slider, Space } from 'ant-design-vue'

// 组件列表
const components = [
  // 按钮：https://2x.antdv.com/components/button-cn
  Button,
  // 下拉菜单：https://2x.antdv.com/components/dropdown-cn
  Dropdown,
  // 导航菜单：https://2x.antdv.com/components/menu-cn
  Menu,
  Menu.Item,
  Menu.Divider,
  Menu.SubMenu,
  // 滑动输入条：https://2x.antdv.com/components/slider-cn
  Slider,
  // 间距：https://2x.antdv.com/components/space-cn
  Space
]

export default (app: App<Element>): void => {
  // 按需引入组件，不能在此处引入图标，否则打包之后无法正常显示，需要在对应的组件中直接进行引用
  for (const component of components) {
    app.component(component.name, component)
  }
}
