/**
 * Created by Administrator on 2019/4/4 0004.
 */
import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from './components/Home.vue'
import TableComponent from './components/TableComponent'
import DialogComponent from './components/DialogComponent'

Vue.use(VueRouter)

const routes = [
  {path: '/home', component: Home},
  {path: '/tableComponent', component: TableComponent},
  {path: '/dialogComponent', component: DialogComponent},
  {path: '*', redirect: '/home'}
]

export default new VueRouter({
  routes,
  mode: 'history'
})
