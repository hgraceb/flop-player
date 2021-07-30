module.exports = {
  // https://cli.vuejs.org/config/#publicpath
  publicPath: './',
  // https://cli.vuejs.org/config/#configurewebpack
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.(bmp)$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192
              }
            }
          ]
        }
      ]
    }
  }
}
