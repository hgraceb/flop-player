# Flop Player

网页版扫雷录像播放器

## 预览

- 在线预览地址：https://hgraceb.github.io/flop-player/

- 使用示例代码：[demo.html](./public/demo.html)

## 特性

1. 录像地图：可自由控制是否显示鼠标轨迹、点击位置、开空区域
2. 录像控制条：可调节进度条或者输入时间节点，对录像进度进行毫秒级的调整
3. 支持本地录像：将录像文件拖放到当前窗口，可直接对录像进行解析和播放
4. 录像解析：可选择对单个录像文件进行解析，通过回调获取录像的基本信息

## 截图

- 主页

  ![flop-player-main](./docs/flop-player-main.png)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fhgraceb%2Fflop-player.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fhgraceb%2Fflop-player?ref=badge_shield)

- 菜单

  ![flop-player-menu](./docs/flop-player-menu.png)

- 文件拖放

  ![flop-player-file-drag](./docs/flop-player-file-drag.png)

## 接口

### flop.playVideo(uri, options)

播放录像接口，参数说明如下：

| 参数                     | 类型                | 说明                                | 默认值    |
| ------------------------ | ------------------- | ----------------------------------- | --------- |
| uri                      | string              | 录像地址                            | -         |
| options                  | object\|undefined   | 播放参数                            | undefined |
| options.share            | object\|undefined   | 分享链接配置                        | undefined |
| options.share.uri        | string              | 分享链接页面录像地址                | -         |
| options.share.title      | string\|undefined   | 分享链接页面标题                    | undefined |
| options.share.favicon    | string\|undefined   | 分享链接页面图标                    | undefined |
| options.share.pathname   | string\|undefined   | 分享链接页面路径名称，开头有一个"/" | '/'       |
| options.share.background | string\|undefined   | 分享链接页面背景样式                | '#eee'    |
| options.share.anonymous  | boolean\|undefined  | 分享链接页面是否匿名显示玩家名称    | false     |
| options.anonymous        | boolean\|undefined  | 是否匿名显示玩家名称                | false     |
| options.background       | string\|undefined   | 遮罩背景样式                        | ''        |
| options.listener         | function\|undefined | 退出录像播放页面的回调              | () => {}  |

### flop.parseFiles(files, onSuccess, onError)

录像解析接口，参数说明如下：

| 参数      | 类型                              | 说明                                     | 默认值   |
| --------- | --------------------------------- | ---------------------------------------- | -------- |
| files     | FileList                          | 录像文件列表，当前只允许包含一个文件对象 | -        |
| onSuccess | (video: Video) => void            | 录像解析成功的回调                       | -        |
| onError   | (info: string) => void\|undefined | 录像解析失败的回调                       | () => {} |

Video 类型说明如下（Video 的其他方法和属性只在 Flop Player 内部使用，未来很有可能发生变化）：

| 方法            | 类型         | 说明                                                        |
| --------------- | ------------ | ----------------------------------------------------------- |
| getTime         | () => number | 获取游戏真实时间（毫秒）                                    |
| getLevel        | () => number | 获取游戏级别，0：未知，1：初级，2：中级，3：高级，4：自定义 |
| getBBBV         | () => number | 获取理论最少左键点击数                                      |
| getLeftClicks   | () => number | 获取左键点击数                                              |
| getRightClicks  | () => number | 获取右键点击数                                              |
| getDoubleClicks | () => number | 获取双击点击数                                              |

### flop.onload()

此方法需要调用者主动重写，Flop Player 将在页面加载完成时调用，如：

```js
if (window.flop) {
    console.log('Flop Player Loaded')
} else {
    window.flop = {
        onload: function () {
            console.log('Flop Player Loaded')
        }
    }
}
```

## 使用

1. 将 Flop Player 打包后的代码复制到工程目录下

2. 引入样式文件，或者将[样式源码](./public/index.css)直接复制到已有的样式文件中

   ```html
   <link href="index.min.css" rel="stylesheet" type="text/css">
   ```

3. 添加一个 `<iframe>` 标签，指定 `src` 为 `index.html`，并添加一个名为 `flop-player-display-none` 的 `class`，`<iframe>` 的基础布局可以自定义，也可以使用默认提供的 `flop-player-iframe`

   ```html
   <iframe class="flop-player-iframe flop-player-display-none" src="index.html"></iframe>
   ```

4. 等待 Flop Player 加载完成（`onload`）后，可以调用播放录像（`playVideo`）和解析录像（`parseFiles`）的接口

5. Flop Player 的代码文件体积有 1MB 左右，首次加载时可能需要等待一段时间，建议可以开启 `gzip` 压缩优化加载速度，不过要注意，开启 `gzip` 压缩可能会消耗服务端一定的性能，可以根据实际情况决定是否开启

## 关于

- 本工程所有测试录像均来自[扫雷网](https://saolei.wang/)、[Authoritative Minesweeper](https://minesweepergame.com/) 公开资源及个人录像
- 本工程的页面 UI 和实现逻辑主要参考自：Winmine、Minesweeper Arbiter 0.52.3、Minesweeper Clone 2007、 Minesweeper Clone 0.97、Freesweeper 10、Viennasweeper 3.0、Minesweeper X 1.15

## 其他

- [Ant Design Vue](https://github.com/vueComponent/ant-design-vue)：🌈 An enterprise-class UI components based on Ant Design and Vue. 🐜
- [Babel](https://github.com/babel/babel)：🐠 Babel is a compiler for writing next generation JavaScript.
- [chardet](https://github.com/runk/node-chardet)：Character encoding detection tool for NodeJS
- [copy-text-to-clipboard](https://github.com/sindresorhus/copy-text-to-clipboard)：Copy text to the clipboard in modern browsers (0.2 kB)
- [Day.js](https://github.com/iamkun/dayjs)：⏰ Day.js 2kB immutable date-time library alternative to Moment.js with the same modern API
- [ESLint](https://github.com/eslint/eslint)：Find and fix problems in your JavaScript code.
- [Minesweeper RAW Video Format](https://github.com/thefinerminer/minesweeper-rawvf)：This project hosts code for converting different videos formats into RAWVF.
- [number-precision](https://github.com/nefe/number-precision)：🚀1K tiny & fast lib for doing addition, subtraction, multiplication and division operations precisely
- [TypeScript](https://github.com/microsoft/TypeScript)：TypeScript is a superset of JavaScript that compiles to clean JavaScript output.
- [Vue 3.0](https://github.com/vuejs/vue-next)：🖖 Vue.js is a progressive, incrementally-adoptable JavaScript framework for building UI on the web.
- [Vue I18n](https://github.com/intlify/vue-i18n-next)：Vue I18n for Vue 3
- [VueUse](https://github.com/vueuse/vueuse)：Collection of essential Vue Composition Utilities for Vue 2 and 3
- [Vuex](https://github.com/vuejs/vuex)：🗃️ Centralized State Management for Vue.js.
- [YAML](https://github.com/eemeli/yaml)：JavaScript parser and stringifier for YAML


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fhgraceb%2Fflop-player.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fhgraceb%2Fflop-player?ref=badge_large)