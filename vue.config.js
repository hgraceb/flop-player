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
    }
  }
}
