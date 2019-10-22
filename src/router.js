import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/add-layer/',
      name: 'add-layer',
      component: () => import(/* webpackChunkName: "add-layer" */ './views/AddLayer.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    },
    {
      path: '/edit-layer/:layerId',
      name: 'edit-layer',
      component: () => import(/* webpackChunkName: "edit-layer" */ './views/EditLayer.vue'),
      props: true
    },
    {
      path: '/login/',
      name: 'login',
      component: () => import(/* webpackChunkName: "login" */ './views/Login.vue')
    },
    {
      path: '/logoff/',
      name: 'logoff',
      component: () => import(/* webpackChunkName: "logoff" */ './views/Logoff.vue')
    }
  ]
})
