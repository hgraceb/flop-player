import { createI18n } from 'vue-i18n'

/**
 * 加载所有本地化信息
 */
function loadLocaleMessages () {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.ya?ml$/i)
  const messages: { [key: string]: any } = {}
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      messages[locale] = locales(key)
    }
  })
  return messages
}

/**
 * 配置 Vue I18n，开发工具参见：https://kazupon.github.io/vue-i18n/guide/tooling.html
 */
export const i18n = createI18n({
  locale: 'zh-Hans',
  messages: loadLocaleMessages()
})
