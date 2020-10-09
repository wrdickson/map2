<template>
  <v-app>
    <MainNav />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import MainNav from './components/mainNav.vue'
export default {
  name: 'App',
  components: {
    MainNav
  },
  data: () => ({
    //
  }),
  computed: {
    user: {
      get: function () {
        return this.$store.state.user
      }
    }
  },
  mounted () {
    //  see if we have a user in Session Storage
    //  yes? commit it to store
    if (sessionStorage.getItem('username') && sessionStorage.getItem('userId') && sessionStorage.getItem('permission') && sessionStorage.getItem('userKey')) {
      let obj = {
        username: sessionStorage.getItem('username'),
        userId: sessionStorage.getItem('userId'),
        permission: sessionStorage.getItem('permission'),
        key: sessionStorage.getItem('userKey')
      }
      this.$store.commit('setUser', obj)
    //  no? commit default 'Guest' user
    } else {
      this.$store.commit('setUserToGuest')
    }
  }
}
</script>
