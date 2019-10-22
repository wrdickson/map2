import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
  strict: true,
  state: {
    user: {
      userId: 0,
      username: 'Guest',
      permission: 0,
      key: '0'
    }
  },
  mutations: {
    setUser (state, nuser) {
      state.user = nuser
    },
    setUserToGuest (state) {
      state.user = {
        userId: 0,
        username: 'Guest',
        permission: 0,
        key: '0'
      }
    }
  },
  actions: {
  }
})
