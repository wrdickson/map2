<template>
  <v-app>
    <v-content>
      <router-view />
    </v-content>
  </v-app>
</template>

<script>

export default {
  name: 'App',
  components: {
  },
  data: () => ({
    //
  }),
  created () {
    //  see if we have a user in Session Storage
    //  yes? commit it to store
    if (sessionStorage.getItem('username') && sessionStorage.getItem('userId') && sessionStorage.getItem('permission') && sessionStorage.getItem('key')) {
      let obj = {
        username: sessionStorage.getItem('username'),
        userId: sessionStorage.getItem('userId'),
        permission: sessionStorage.getItem('permission'),
        key: sessionStorage.getItem('key')
      }
      this.$store.commit('setUser', obj)
    //  no? commit default 'Guest' user
    } else {
      this.$store.commit('setUserToGuest')
    }
  }
}
</script>
