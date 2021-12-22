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
      // https://v4.webpack.js.org/plugins/split-chunks-plugin/
      splitChunks: {
        // 在 Windows 10、Chrome 96.0.4664.110、Disable cache、Slow 3G 的本地环境下测试不同 minSize 和 maxSize 对页面加载时间（Load）的影响，结果如下：
        // |                                    | 1     | 2     | 3     | 4     | 5     | 6     | 7     | 8     | 9     | 10    | 平均(s) |
        // | ---------------------------------  | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ------- |
        // | minSize = 30000 ，maxSize = 0      | 24.46 | 24.44 | 24.46 | 24.48 | 24.44 | 24.43 | 24.48 | 24.46 | 24.42 | 24.48 | 24.455  |
        // | minSize = 30000 ，maxSize = 250000 | 26.05 | 26.01 | 25.99 | 26.03 | 26.01 | 25.99 | 26.02 | 26.03 | 26.05 | 26.02 | 26.02   |
        // | minSize = 250000，maxSize = 250000 | 25.53 | 25.57 | 25.59 | 25.53 | 25.57 | 25.56 | 25.55 | 25.51 | 25.55 | 25.54 | 25.55   |
        // 测试结果与正式环境的表现不一致，暂时以线上环境表现较好的配置：minSize = 30000（默认），maxSize = 250000，对 chunks 进行拆分，优化首屏加载时长、提高资源文件复用率
        maxSize: 250000
      }
    }
  }
}
