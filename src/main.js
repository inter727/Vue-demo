import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/common.css'

new Vue({
  el: '#app',
  render: h => h(App),
  router
})
