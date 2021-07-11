module.exports = {
  chainWebpack: config => {
    config.module
      .rule('file-loader')
      .test(/\.(bmp)$/i)
      .use('file-loader')
      .loader('file-loader')
  }
}
