module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.(bmp)$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192,
              },
            },
          ],
        },
      ],
    },
  },
}
