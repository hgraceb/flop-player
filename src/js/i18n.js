export let i18n;

if (document.documentElement.lang && document.documentElement.lang.startsWith('en')) {
    i18n = require('../i18n/en.json');
} else {
    i18n = require('../i18n/zh.json');
}