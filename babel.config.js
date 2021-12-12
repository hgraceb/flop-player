module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'import',
      {
        libraryName: 'ant-design-vue',
        libraryDirectory: 'es',
        style: true
      }
    ]
  ],
  "env": {
    "production": {
      "plugins": [
        // 生产环境下移除日志打印
        ["transform-remove-console", {"exclude": ["error", "warn"]}]
      ]
    }
  }
}
