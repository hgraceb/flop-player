import './styles/common.css'

import { createApp } from 'vue'
import App from './App.vue'
import { store } from './store'
import { i18n } from '@/i18n'
import NP from 'number-precision'
import installElementPlus from './plugins/element'

// If you want to get rid of XXX is beyond boundary when transfer to integer, the results may not be accurate, use this at the beginning of your app to turn off boundary checking.
// https://github.com/nefe/number-precision#usage
NP.enableBoundaryChecking(false) // default param is true

const app = createApp(App)
installElementPlus(app)
app.use(store).use(i18n).mount('#app')
