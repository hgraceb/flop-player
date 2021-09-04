import './styles/common.css'

import { createApp } from 'vue'
import App from './App.vue'
import { store } from './store'
import { i18n } from '@/i18n'

createApp(App).use(store).use(i18n).mount('#app')
