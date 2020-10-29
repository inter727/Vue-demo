/**
 * Created by Administrator on 2019/4/4 0004.
 */
import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from './components/Home.vue'
import TableComponent from './components/TableComponent'
import DialogComponent from './components/DialogComponent'
import Map from './components/Map'
import RichEditor from "@/components/RichEditor";

Vue.use(VueRouter)

const routes = [
  {path: '/home', component: Home},
  {path: '/tableComponent', component: TableComponent},
  {path: '/dialogComponent', component: DialogComponent},
  {path: '/map', component: Map},
  {path: '/editor', component: RichEditor},
  {path: '*', redirect: '/home'}
]

export default new VueRouter({
  routes,
  mode: 'history'
})
