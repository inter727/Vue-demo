import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import Editor from "wangeditor";

import 'element-ui/lib/theme-chalk/index.css'
import './assets/common.css'
import 'ol/ol.css';

Vue.prototype.$editor = Editor
Vue.use(ElementUI)

new Vue({
  el: '#app',
  render: h => h(App),
  router
})
