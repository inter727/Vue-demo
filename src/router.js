/**
 * Created by Administrator on 2019/4/4 0004.
 */
import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from './components/Home.vue'
import Table from './components/Table.vue'
import Component from './components/Component.vue'

Vue.use(VueRouter)

const routes = [
  {path: '/home', component: Home},
  {path: '/table', component: Table},
  {path: '/component', component: Component},
  {path: '*', redirect: '/home'}
]

export default new VueRouter({
  routes,
  mode: 'history'
})
