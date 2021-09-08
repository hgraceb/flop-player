module.exports = {
  // https://cli.vuejs.org/config/#publicpath
  publicPath: './',
  // https://cli.vuejs.org/config/#productionsourcemap
  productionSourceMap: false,
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
    }
  }
}
