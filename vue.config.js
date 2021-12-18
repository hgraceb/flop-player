const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')

module.exports = {
  // https://cli.vuejs.org/config/#publicpath
  publicPath: './',
  // https://cli.vuejs.org/config/#productionsourcemap
  productionSourceMap: false,
  // https://cli.vuejs.org/config/#chainwebpack
  chainWebpack: config => {
    config.plugin('copy').tap(([options]) => {
      // 复制 public 文件夹时忽略测试文件，在 configureWebpack 中配置无法生效
      options[0].ignore.push('favicon.ico', 'demo.html', 'index.css', 'videos/**/*')
      return [options]
    })
  },
  // https://cli.vuejs.org/config/#configurewebpack
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.ya?ml$/,
          // https://www.npmjs.com/package/yaml-loader
          type: 'json', // Required by Webpack v4
          // https://github.com/eemeli/yaml-loader
          use: 'yaml-loader'
        }
      ]
    },
    resolve: {
      alias: {
        // 解决警告: You are running the esm-bundler build of vue-i18n. It is recommended to configure your bundler to explicitly replace feature flag globals with boolean literals to get proper tree-shaking in the final bundle.
        'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js'
      }
    },
    plugins: [
      // 使用 Day.js 替换 Moment.js，优化打包体积，https://github.com/ant-design/antd-dayjs-webpack-plugin
      new AntdDayjsWebpackPlugin({
        preset: 'antdv3'
      })
    ],
    optimization: {
      // https://webpack.js.org/plugins/split-chunks-plugin/
      splitChunks: {
        minSize: 10000,
        // 拆分 chunks，优化首屏加载时长
        maxSize: 250000
      }
    }
  }
}
