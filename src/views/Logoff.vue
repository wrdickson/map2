<template>
  <v-container>
    <v-row>
      <v-col>
        <h2>Logoff</h2>
        <v-btn
          @click="logoff"
        >
          Logoff
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <hr>
        <div>Username: {{ user.username }} </div>
        <div>UserId: {{ user.userId }} </div>
        <div>UserPerm: {{ user.permission }} </div>
        <div>UserKey: {{ user.key }} </div>
        <hr>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from './../api/api.js'
export default {
  name: 'Logoff',
  computed: {
    user: {
      get: function () {
        return this.$store.state.user
      }
    }
  },
  methods: {
    logoff () {
      api.user.logoff(this.user.userId, this.user.key).then(response => {
        console.log('logoff', response)
        //  we don't care if the server was able to correctly logoff.
        //  we reset local values
        sessionStorage.setItem('username', 'Guest')
        sessionStorage.setItem('userId', 0)
        sessionStorage.setItem('permission', 0)
        sessionStorage.setItem('userKey', 0)
        console.log('this', this)
        this.$store.commit('setUserToGuest')
      })
    }
  }
}
</script>

<style scoped>

</style>
