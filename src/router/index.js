import Vue from 'vue'
import VueRouter from 'vue-router'
import Init from '../views/Init.vue'
import Limit from '../views/Limit.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'init',
    component: Init
  },
  {
    path: '/limit',
    name: 'limit',
    component: Limit
  },
  {
    path: '/home',
    name: 'home',
    component: () => import(/* webpackChunkName: "main" */ '../views/Home.vue'),
    meta: { requiredAuth: true }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
