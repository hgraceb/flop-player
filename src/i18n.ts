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
 * 获取默认语言
 */
function getDefaultLocale () {
  const languages = navigator.languages || [navigator.language]
  for (const language of languages) {
    // 简体中文
    if (/^zh-CN$/i.test(language)) {
      return 'zh-Hans'

      // 除简体中文外的所有中文默认使用繁体中文
    } else if (/^zh\b/i.test(language)) {
      return 'zh-Hant'

      // 英语
    } else if (/^en\b/i.test(language)) {
      return 'en'
    }
  }
  // 默认使用英语
  return 'en'
}

/**
 * 配置 Vue I18n，开发工具参见：https://kazupon.github.io/vue-i18n/guide/tooling.html
 */
export const i18n = createI18n({
  locale: getDefaultLocale(),
  messages: loadLocaleMessages()
})
