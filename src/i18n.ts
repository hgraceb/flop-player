import { createI18n } from 'vue-i18n'
import en from '@/locales/en.yml'
import zhHans from '@/locales/zh-Hans.yml'

export const i18n = createI18n({
  locale: 'zh-Hans',
  messages: {
    en: en,
    'zh-Hans': zhHans
  }
})
